const Timeout = require("smart-timeout");
const utils = require("@iobroker/adapter-core");
const serverWithPort = require("./server/serverWithPort");

class RadarTrap extends utils.Adapter {
	constructor(options) {
		super({
			...options,
			name: "radar-trap",
		});

		this.trapsIntervalMap = new Map();

		this.on("ready", this.onReady.bind(this));
		this.on("stateChange", this.onStateChange.bind(this));
		// this.on("objectChange", this.onObjectChange.bind(this));
		// this.on("message", this.onMessage.bind(this));
		this.on("unload", this.onUnload.bind(this));
	}

	async onReady() {
		process.env["MBX_ACCESS_TOKEN"] = this.config.mbxAccessToken; // Muss in onReady direkt gesetzt werden
		process.env["OPENCAGE_ID"] = this.config.opencageId; // Muss in onReady direkt gesetzt werden

		const server = serverWithPort(this.config.feathersPort, this);

		const routeService = server.service("routes");
		const diretionServive = server.service("directions");
		const trapService = server.service("traps");

		const normalizeProperties = (properties) => {
			const info = properties.info !== "false" && properties.info;

			return {
				lng: +properties.lng,
				lat: +properties.lat,
				type_text: properties.type_text,
				street: properties.street,
				vmax: properties.vmax && properties.vmax !== "?" && properties.vmax,
				create_date: properties.create_date !== "0000-00-00 00:00:00" && properties.create_date,
				confirm_date: properties.confirm_date !== "0000-00-00 00:00:00" && properties.confirm_date,
				reason: info && info.reason,
				length: info && info.length,
				duration: info && info.duration && Math.round(+info.duration / 60),
				delay: info && info.delay && Math.round(+info.delay / 60),
			};
		};

		const trapsReducerFunc = (list, trap) => {
			list["fixedTraps"] = trap.fixedTraps.map(fixedTrap => normalizeProperties(fixedTrap.properties));
			list["mobileTraps"] = trap.mobileTraps.map(mobileTrap => normalizeProperties(mobileTrap.properties));
			list["roadWorks"] = trap.roadWorks.map(roadWork => normalizeProperties(roadWork.properties));
			list["trafficJams"] = trap.trafficJams.map(trafficJam => normalizeProperties(trafficJam.properties));
			list["sleekness"] = trap.sleekness.map(sleekness => normalizeProperties(sleekness.properties));
			list["accidents"] = trap.accidents.map(accident => normalizeProperties(accident.properties));
			list["fog"] = trap.fog.map(fog => normalizeProperties(fog.properties));
			list["objects"] = trap.objects.map(object => normalizeProperties(object.properties));

			return list;
		};

		const updateTraps = async traps => {
			// console.log("TRAPS AFTER CREATE OR UPDATE", traps);
			const {data: [{duration: directionDuration, distance: directionDistance}]} = await diretionServive.find(
				{query: {routeId: traps.routeId, profile: traps.profile, $select: ["duration", "distance"]}});

			const renewDuration = await routeService.get(traps.routeId).then(res => res.settings.duration);

			const normalizedTraps = [traps].reduce(trapsReducerFunc, {});

			await this.extendObjectAsync(`${traps.routeId}.${traps._id}`, {type: "channel", common: {name: traps.profile}});

			await this.extendObjectAsync(`${traps.routeId}`, {native: {routeId: traps.routeId, directionId: traps.directionId, trapsId: traps._id}});

			await Promise.all([
				...Object.keys(normalizedTraps)
					.map(async name => await this.createStateAsync(traps.routeId, traps._id, name,
						{defAck: true, read: true, write: true, type: "string", role: "json", def: JSON.stringify(normalizedTraps[name])}).then(() => {
						// console.log("INSIDE CALLBACK", name);
						return this.setStateAsync(`${traps.routeId}.${traps._id}.${name}`, JSON.stringify(normalizedTraps[name]), true);
					})),

				this.createStateAsync(traps.routeId, null, "distance",
					{defAck: true, read: true, write: false, type: "number", role: "value", def: Math.round(directionDistance)}).then(() => {
					return this.setStateAsync(`${traps.routeId}.distance`, Math.round(directionDistance), true);
				}),

				this.createStateAsync(traps.routeId, null, "duration",
					{defAck: true, read: true, write: false, type: "number", role: "value", def: Math.round(directionDuration)}).then(() => {
					return this.setStateAsync(`${traps.routeId}.duration`, Math.round(directionDuration), true);
				}),

				this.createStateAsync(traps.routeId, null, "timer",
					{defAck: true, read: true, write: true, type: "number", role: "value", def: renewDuration * 60}).then(() => {
					// console.log("INSIDE CALLBACK TIMER");
					return this.setStateAsync(`${traps.routeId}.timer`, renewDuration * 60, true);
				})]);

			if (Timeout.exists(traps._id)) {
				Timeout.clear(traps._id);
			}
			Timeout.set(traps._id, async () => await trapService.update(traps._id, {routeId: traps.routeId, directionId: traps.directionId, profile: traps.profile},
				{from: "renew-handler"}), Math.floor(renewDuration * 60 * 1000));

			if (this.trapsIntervalMap.has(traps._id)) {
				clearInterval(this.trapsIntervalMap.get(traps._id));
				this.trapsIntervalMap.delete(traps._id);
			}
			this.trapsIntervalMap.set(traps._id, setInterval(async () => {
				if (Timeout.exists(traps._id)) {
					const id = `${traps.routeId}.timer`;
					// console.log("REMAINING", Timeout.remaining(traps._id));
					await this.setStateAsync(id, Timeout.remaining(traps._id) < 2000 ? 0 : Math.round(Timeout.remaining(traps._id) / 1000), true);
				}
			}, 2000));
		};

		trapService.on("created", updateTraps);

		trapService.on("updated", updateTraps);

		trapService.on("removed", traps => {
			if (Timeout.exists(traps._id)) {
				Timeout.clear(traps._id);
			}

			if (this.trapsIntervalMap.has(traps._id)) {
				clearInterval(this.trapsIntervalMap.get(traps._id));
				this.trapsIntervalMap.delete(traps._id);
			}
		});

		routeService.on("patched", async route => {
			// console.log("ROUTE PATCHED: ", route);
			await this.extendObjectAsync(`${route._id}`, {type: "device", common: {name: `${route.start.titel} -> ${route.ziel.titel}`}});
		});

		routeService.on("removed", async route => {
			await this.deleteDeviceAsync(route._id);
		});

		const routes = await routeService.find();
		for (const route of routes.data) {
			const {data: [traps]} = await trapService.find({query: {routeId: route._id}});

			const {data: [{duration: directionDuration, distance: directionDistance}]} = await diretionServive.find(
				{query: {routeId: route._id, profile: route.settings.profile, $select: ["duration", "distance"]}});

			const renewDuration = route.settings.duration;

			const normalizedTraps = [traps].reduce(trapsReducerFunc, {});

			if (traps !== undefined) {
				await this.createDeviceAsync(route._id, {name: `${route.start.titel} -> ${route.ziel.titel}`},
					{routeId: route._id, directionId: traps.directionId, trapsId: traps._id});

				await this.createChannelAsync(route._id, traps._id, {name: route.settings.profile});

				await Promise.all([
					...Object.keys(normalizedTraps).map(name => this.createStateAsync(route._id, traps._id, name,
						{defAck: true, read: true, write: true, type: "string", role: "json", def: JSON.stringify(normalizedTraps[name])},
					)),
					this.createStateAsync(route._id, null, "distance",
						{defAck: true, read: true, write: false, type: "number", role: "value", def: Math.round(directionDistance)}),

					this.createStateAsync(route._id, null, "duration",
						{defAck: true, read: true, write: false, type: "number", role: "value", def: Math.round(directionDuration)}),

					this.createStateAsync(route._id, null, "timer", {defAck: true, read: true, write: false, type: "number", role: "value", def: renewDuration * 60}),
				]);

				Timeout.set(traps._id,
					async () => await trapService.update(traps._id, {routeId: traps.routeId, directionId: traps.directionId, profile: traps.profile},
						{from: "renew-handler"}), Math.floor(renewDuration * 60 * 1000));

				this.trapsIntervalMap.set(traps._id, setInterval(async () => {
					if (Timeout.exists(traps._id)) {
						const id = `${route._id}.timer`;
						await this.setStateAsync(id, Timeout.remaining(traps._id) < 2000 ? 0 : Math.round(Timeout.remaining(traps._id) / 1000), true);
					}
				}, 2000));
			}
		}
	}

	onUnload(callback) {
		try {
			const timerIds = Object.keys(Timeout.metadata);
			timerIds.forEach(id => Timeout.clear(id));

			for (const interval of this.trapsIntervalMap.values()) {
				clearInterval(interval);
			}

			callback();
		} catch (e) {
			callback();
		}
	}

	// If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
	// You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
	// /**
	//  * Is called if a subscribed object changes
	//  * @param {string} id
	//  * @param {ioBroker.Object | null | undefined} obj
	//  */
	// onObjectChange(id, obj) {
	// 	if (obj) {
	// 		// The object was changed
	// 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
	// 	} else {
	// 		// The object was deleted
	// 		this.log.info(`object ${id} deleted`);
	// 	}
	// }

	onStateChange(id, state) {
		if (state) {
			// The state was changed
			this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
		} else {
			// The state was deleted
			this.log.info(`state ${id} deleted`);
		}
	}

	// If you need to accept messages in your adapter, uncomment the following block and the corresponding line in the constructor.
	// /**
	//  * Some message was sent to this instance over message box. Used by email, pushover, text2speech, ...
	//  * Using this method requires "common.messagebox" property to be set to true in io-package.json
	//  * @param {ioBroker.Message} obj
	//  */
	// onMessage(obj) {
	// 	if (typeof obj === "object" && obj.message) {
	// 		if (obj.command === "send") {
	// 			// e.g. send email or pushover or whatever
	// 			this.log.info("send command");

	// 			// Send response in callback if required
	// 			if (obj.callback) this.sendTo(obj.from, obj.command, "Message received", obj.callback);
	// 		}
	// 	}
	// }

}

if (require.main !== module) {
	// Export the constructor in compact mode
	module.exports = (options) => new RadarTrap(options);
} else {
	// otherwise start the instance directly
	new RadarTrap();
}
