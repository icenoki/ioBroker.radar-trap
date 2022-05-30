/* global $ turf mapboxgl io feathers vis systemDictionary */

function isArray(it) {
	if (typeof Array.isArray === "function") return Array.isArray(it);
	return Object.prototype.toString.call(it) === "[object Array]";
}

if (vis.editMode) {
	$.extend(true, systemDictionary, {
		"route": {
			"en": "route", "de": "Route",
		},
		"routeColor": {
			"en": "route color", "de": "Routen-Farbe",
		},
		"clusterColor": {
			"en": "cluster color", "de": "Cluster-Farbe",
		},
		"symbolColor": {
			"en": "symbol color", "de": "Symbol-Farbe",
		},
		"styleSelect": {
			"en": "style", "de": "Stil",
		},
		"fitButton": {
			"en": "fit button", "de": "Fit-Button",
		},
		"satellite-v9": {
			"en": "satellite-v9", "de": "satellite-v9",
		},
		"satellite-streets-v11": {
			"en": "satellite-streets-v11", "de": "satellite-streets-v11",
		},
		"streets-v11": {
			"en": "streets-v11", "de": "streets-v11",
		},
		"light-v10": {
			"en": "light-v10", "de": "light-v10",
		},
		"dark-v10": {
			"en": "dark-v10", "de": "dark-v10",
		},
		"navigation-night-v1": {
			"en": "navigation-night-v1", "de": "navigation-night-v1",
		},
		"outdoors-v11": {
			"en": "outdoors-v11", "de": "outdoors-v11",
		},
		"noNothingInfo": {
			"en": "no nothing info", "de": "Traps Info nur wenn vorhanden",
		},
		"group_Traps": {
			"en": "show traps", "de": "Traps anzeigen",
		},
	});
}

$.extend(true, systemDictionary, {
	"fixedTraps": {
		"en": "fixed traps", "de": "Blitzer fest",
	},
	"mobileTraps": {
		"en": "mobile traps", "de": "Blitzer mobil",
	},
	"trafficJams": {
		"en": "traffic jams", "de": "Staus",
	},
	"accidents": {
		"en": "accidents", "de": "Unfälle",
	},
	"roadWorks": {
		"en": "road works", "de": "Baustellen",
	},
	"sleekness": {
		"en": "sleekness", "de": "Glätte",
	},
	"fog": {
		"en": "fog", "de": "Nebel",
	},
	"objects": {
		"en": "objects", "de": "Gegenstände",
	},
});

vis.binds["radar-trap"] = {
	version: "0.0.1",
	feathersClient: null,
	ids: null,
	native: null,
	showVersion: function() {
		console.log("Version radar-trap: " + vis.binds["radar-trap"].version);
	},
	selectRouteId: function(widAttr) {
		// console.log("WIDATTR", widAttr);
		return vis.editSelect(widAttr, [
				"",
				...Object.entries(vis.objects)
					.filter(([key, val]) => key.split(".")[0] === "radar-trap" && val.type === "device")
					.map(([, value]) => value.common.name + " | " + value.native.routeId)],
			true);
	},
	initRadarTrap: function() {
		// console.log("INITFEATHERSCLIENT", vis);

		if (!vis.conn) {
			// console.log("INITFEATHERSCLIENT -> TIMEOUT");
			setTimeout(function() {
				vis.binds["radar-trap"].initRadarTrap();
			}, 100);
			return;
		}

		vis.conn._socket.emit("getObjectView", "system", "instance", {startkey: "system.adapter.radar-trap", endkey: "system.adapter.radar-trap.\u9999"},
			function(err, res) {
				// console.log("objectView Error", err);
				// console.log("objectView", res);
				vis.binds["radar-trap"].native = {...res.rows[0].value.native};

				let socket;
				if (vis.binds["radar-trap"].native.httpsEnabled === true) {
					socket = io.connect(`https://${document.domain}:${vis.binds["radar-trap"].native.feathersPort}`, {rejectUnauthorized: false});
				} else {
					socket = io.connect(`http://${document.domain}:${vis.binds["radar-trap"].native.feathersPort}`, {rejectUnauthorized: false});
				}

				vis.binds["radar-trap"].feathersClient = feathers();
				vis.binds["radar-trap"].feathersClient.configure(feathers.socketio(socket));

				vis.binds["radar-trap"].feathersClient.service("directions").on("updated", vis.binds["radar-trap"].mapbox.onUpdatedListener);
				vis.binds["radar-trap"].feathersClient.service("traps").on("updated", vis.binds["radar-trap"].mapbox.onUpdatedListener);

				console.log("Feathers Client was initialized!");
			});

		vis.conn._socket.emit("getObjectView", "system", "device", {startkey: "radar-trap", endkey: "radar-trap.\u9999"}, function(err, res) {
			// console.log("IDS Error", err);
			// console.log("IDS objectView", res);

			vis.binds["radar-trap"].ids = res.rows.reduce((ids, row) => {
				// ids = {...ids, ...{[row.value.common.name]: row.value.native}};
				ids = {...ids, ...{[row.value.native.routeId]: {trapsId: row.value.native.trapsId, directionId: row.value.native.directionId}}};
				return ids;
			}, {});

			// console.log("IDS", vis.binds["radar-trap"].ids);
		});
	},
	mapbox: {
		convertTrapsData: function($mapbox) {
			return turf.featureCollection(...[$mapbox.data("traps")].map(trap => Object.values(trap).reduce((list, t) => {
				if (isArray(t)) {
					const lineTraps = t.filter(obj => obj.properties.polyline !== "").map(obj => obj.properties.polyline);
					return [...list, ...t, ...lineTraps];
				}
				return list;
			}, [])));
		},
		onUpdatedListener: function(data) {
			const $data = $("div").find("[id^=mapbox_]");
			const $mapboxes = [];

			console.log("$DATA onUpdatedListener", $data);

			$data.each(function() {
				// console.log("$DATA direction", $(this).data("direction"));

				if ($(this).data("direction") && data._id === $(this).data("direction")._id) {
					$(this).data("direction", data);
					$mapboxes.push($(this));
					// console.log("TREFFER DIRECTION");
				}

				if ($(this).data("traps") && data._id === $(this).data("traps")._id) {
					$(this).data("traps", data);
					$mapboxes.push($(this));
					// console.log("TREFFER TRAPS");
				}
			});

			if ($mapboxes.length) {
				$mapboxes.forEach(($mapbox) => {
					vis.binds["radar-trap"].mapbox.updateMap($mapbox);
				});
			}
		},
		init: async function(wid, view, data, style) {
			const $div = $(`#${wid}`);

			if (!$div.length) {
				// console.log("INIT -> TIMEOUT");
				setTimeout(function() {
					vis.binds["radar-trap"].mapbox.init(wid, view, data, style);
				}, 100);
				return;
			}

			// console.log("INIT");
			// console.log("STYLE", style);
			// console.log("VIS", vis);
			// console.log("DATA", data);

			$div.data("destroy", (widget, $widget) => {
				// console.log("DESTROY WIDGET", widget, $widget);
			});

			const $mapbox = $div.find(`#mapbox_${wid}`);

			if (data.route) {
				const route = data["route"].split("|")[1].trim();

				const direction = await vis.binds["radar-trap"].feathersClient.service("directions").get(vis.binds["radar-trap"].ids[route].directionId);
				$mapbox.data("direction", direction);
				// console.log("DIRECTION", $mapbox.data("direction"));

				const traps = await vis.binds["radar-trap"].feathersClient.service("traps").get(vis.binds["radar-trap"].ids[route].trapsId);
				$mapbox.data("traps", traps);
				// console.log("TRAPS", $mapbox.data("traps"));
			} else {
				$mapbox.data("direction", null);
				// console.log("DIRECTION NULL", $mapbox.data("direction"));

				$mapbox.data("traps", null);
				// console.log("TRAPS NULL", $mapbox.data("traps"));
			}

			$mapbox.data("map", vis.binds["radar-trap"].mapbox.showmap(`mapbox_${wid}`, $mapbox, data));
		},
		showmap: function(divId, $mapbox, data) {
			if (!data["styleSelect"]) {
				setTimeout(() => {
					vis.binds["radar-trap"].mapbox.showmap(divId, $mapbox, data);
				}, 100);

				return;
			}

			// console.log("DATA inside showmap", data);
			const map = new mapboxgl.Map({
				attributionControl: false,
				accessToken: vis.binds["radar-trap"].native.mbxAccessToken,
				container: divId,
				style: `mapbox://styles/mapbox/${data["styleSelect"]}`,
				bounds: [[4.751874, 47.202310], [15.306672, 55.984171]],
			});

			let doFit = true;
			map.on("resize", () => {
				if (doFit) {
					const directionLine = $mapbox.data("direction") && turf.feature($mapbox.data("direction").directionLine);
					if (directionLine) {
						map.fitBounds(turf.bbox(directionLine), {padding: 20});
					} else {
						map.fitBounds([[4.751874, 47.202310], [15.306672, 55.984171]]);
					}

					doFit = false;
					setTimeout(() => doFit = true, 100);
				}
			});

			if (!data["route"]) {
				// console.log("Keine route ausgewält ...");
				return;
			}

			const directionLine = $mapbox.data("direction") && turf.feature($mapbox.data("direction").directionLine);
			const trapsData = vis.binds["radar-trap"].mapbox.convertTrapsData($mapbox);

			directionLine && map.on("load", () => {
				[
					"icon-fixed-trap",
					"icon-mobile-trap",
					"icon-traffic-jam",
					"icon-road-work",
					"icon-accident",
					"icon-object",
					"icon-sleekness",
					"icon-fog",
					"icon-wrong-way-driver"].forEach(image => {
					if (!map.hasImage(image)) {
						map.loadImage((`http://${document.domain}:8082/vis/widgets/radar-trap/img/mapbox/map-icons/${image}.png`), (error, mapimage) => {
							if (error) throw error;

							map.addImage(image, mapimage, {"sdf": true});
						});
					}
				});

				map.addSource("route", {
					type: "geojson", data: directionLine,
				});
				map.addSource("clustertraps", {
					type: "geojson",
					data: trapsData,
					cluster: true,
					clusterMaxZoom: 14,
					clusterRadius: 50,
				});
				map.addSource("traps", {
					type: "geojson",
					data: trapsData,
				});

				map.addLayer(vis.binds["radar-trap"].mapbox.getMapStyle("route", data));
				map.addLayer(vis.binds["radar-trap"].mapbox.getMapStyle("lineTraps", data));
				map.addLayer(vis.binds["radar-trap"].mapbox.getMapStyle("traps", data));
				map.addLayer(vis.binds["radar-trap"].mapbox.getMapStyle("clusterTraps", data));
				map.addLayer(vis.binds["radar-trap"].mapbox.getMapStyle("clusterTrapsCount", data));

				if (!vis.editMode) {
					const popup = new mapboxgl.Popup({closeButton: false, closeOnClick: false});

					map.on("mouseenter", "traps", event => {
						map.getCanvas().style.cursor = "pointer";
						const coordinates = event.features[0].geometry.coordinates.slice();
						const properties = event.features[0].properties;
						const info = properties.info !== "false" && JSON.parse(properties.info);

						const text = {
							longitude: event.lngLat[0],
							latitude: event.lngLat[1],
							typeText: properties.type_text,
							street: properties.street,
							vmax: properties.vmax && properties.vmax !== "?" && properties.vmax,
							createDate: properties.create_date !== "0000-00-00 00:00:00" && properties.create_date,
							confirmDate: properties.confirm_date !== "0000-00-00 00:00:00" && properties.confirm_date,
							reason: info && info?.reason,
							length: info && info?.length,
							duration: info && info.duration && Math.round(+info.duration / 60),
							delay: info && info.delay && Math.round(+info.delay / 60),
						};

						while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
							coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
						}

						popup.setLngLat(coordinates).setHTML(
							`	<div>
									<div>${text?.typeText || ""}</div>
							 		<div>${text.street ? `Ort: ${text.street}` : ""}</div>
							 		<div>${text.vmax ? `Höchstgeschwindigkeit: ${text.vmax} km/h` : ""}</div>
							 		<div>${text.reason ? `Grund: ${text.reason}` : ""}</div>
							 		<div>${text.length ? `Staulänge: ${text.length} km` : ""}</div>
							 		<div>${text.duration ? `Dauer: ${text.duration} min.` : ""}</div>
							 		<div>${text.delay ? `Verzögerung: ${text.delay} min.` : ""}</div>
							 		<div>${text.createDate ? `gemeldet: ${text.createDate}` : ""}</div>
							 		<div>${text.confirmDate ? `bestätigt: ${text.confirmDate}` : ""}</div>
								</div>`,
						).addTo(map);
					});

					map.on("mouseleave", "traps", () => {
						map.getCanvas().style.cursor = "";
						popup.remove();
					});
				}

				if (!vis.editMode) {
					map.on("click", "cluster-traps", event => {
						if (!event.features.length || !event.features[0].properties.cluster_id) return;

						const feature = event.features[0];
						const clusterId = feature.properties.cluster_id;
						const sourceId = feature.source;

						const mapboxSource = map.getSource(sourceId);

						mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
							if (err) return;

							map.easeTo({
								center: feature.geometry.coordinates,
								zoom: zoom,
							});
						});
					});

					map.on("mouseenter", "cluster-traps", () => {
						map.getCanvas().style.cursor = "pointer";
					});
					map.on("mouseleave", "cluster-traps", () => {
						map.getCanvas().style.cursor = "";
					});
				}

				if (!vis.editMode && data["fitButton"]) {
					$(`#mapbox_button_${data["wid"]}`).on("click", function() {
						const directionLine = $mapbox.data("direction") && turf.feature($mapbox.data("direction").directionLine);
						map.fitBounds(turf.bbox(directionLine), {padding: 20});
					});
				}

				if (!data["fitButton"]) {
					$(`#mapbox_button_${data["wid"]}`).addClass("radar-trap-button-hidden");
				}

				map.fitBounds(turf.bbox(directionLine), {padding: 20});

				const $div = $(`#${divId}`);
				$div.css("border-radius", $div.parent().css("border-radius")).css("overflow", "hidden");
			});

			return map;
		},
		updateMap: function($mapbox) {
			const map = $mapbox.data("map");
			// console.log("MAP", map);
			const direction = $mapbox.data("direction");

			const directionLine = turf.feature(direction.directionLine);
			direction && map.getSource("route").setData(directionLine);
			direction && map.fitBounds(turf.bbox(directionLine), {padding: 20});

			const trapsData = vis.binds["radar-trap"].mapbox.convertTrapsData($mapbox);
			direction && map.getSource("clustertraps").setData(trapsData);
			direction && map.getSource("traps").setData(trapsData);
		}

		,
		getMapStyle: function(key, data) {
			const mapStyles = {
				route: {
					id: "route",
					type: "line",
					source: "route",
					layout: {
						"line-join": "round", "line-cap": "round",
					},
					paint: {
						"line-color": data["routeColor"],
						"line-width": 5,
						"line-opacity": 0.8,
					},
				},
				traps: {
					id: "traps",
					type: "symbol",
					source: "clustertraps",
					// filter: ["match", ["get", "type_name"], "fixed-trap", true, false],
					layout: {
						"icon-allow-overlap": true, "icon-image": [
							"match",
							["get", "type_name"],
							"fixed-trap", "icon-fixed-trap",
							"mobile-trap", "icon-mobile-trap",
							"traffic-jam", "icon-traffic-jam",
							"road-work", "icon-road-work",
							"accident", "icon-accident",
							"object", "icon-object",
							"sleekness", "icon-sleekness",
							"fog", "icon-fog",
							"wrong-way-driver", "icon-wrong-way-driver",
							""],
						"icon-size": ["interpolate", ["linear"], ["zoom"], 1, 0.6, 14, 1.2],
						/*[
							"match", ["get", "type_name"],
							"fixed-trap", ["interpolate", ["linear"], ["zoom"], 3, 0.6, 12, 1.5],
							"mobile-trap", 0.4,
							"traffic-jam", 0.4,
							"road-work", 0.4,
							"accident", 0.4,
							"object", 0.4,
							"sleekness", 0.4,
							"fog", 0.4,
							0.4,
							// "interpolate", ["linear"], ["zoom"], 3, 0.4, 14, 0.9
						],*/
					},
					paint: {
						"icon-color": data["symbolColor"],
						"icon-opacity": 0.8,
					},
				},
				clusterTraps: {
					id: "cluster-traps",
					type: "circle",
					source: "clustertraps",
					filter: ["has", "point_count"],
					paint: {
						"circle-color": ["step", ["get", "point_count"], data["clusterColor"], 100, data["clusterColor"], 750, "#E1BEE7"],
						"circle-radius": ["step", ["get", "point_count"], 15, 2, 15],
					},
				},
				clusterTrapsCount: {
					id: "cluster-traps-count",
					type: "symbol",
					source: "clustertraps",
					filter: ["has", "point_count"],
					layout: {
						"text-allow-overlap": true,
						"text-field": "{point_count_abbreviated}",
						"text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
						"text-size": 12,
					},
				},
				lineTraps: {
					id: "line-traps",
					type: "line",
					source: "traps",
					filter: ["has", "linetrap"],
					layout: {
						"line-join": "round", "line-cap": "round",
					},
					paint: {
						"line-color": "#ff0000",
						"line-width": 9,
						"line-opacity": 1,
						"line-dasharray": [1, 1.5],
					},
				},
			};

			return mapStyles[key];
		}
		,
	},
	trapsInfo: {
		bindListClickEventHandler: function($div) {
			$div.find("li").each(function() {
				$(this).bind("click", function() {

					Object.entries(vis.views[vis.activeView].widgets).forEach(([key, {tpl, data}]) => {
						if (tpl !== "tplMapbox") return;

						const route = data["route"].split("|")[1].trim();
						if ($(this).data("route") === route) {
							const map = $(`#mapbox_${key}`).data("map");

							map.jumpTo({
								center: $(this).data("position"),
								zoom: 15,
							});
						}
					});
				});
			});
		},
		init: async function(wid, view, data, style) {
			if (!data["route"]) return;

			const $div = $(`#${wid}`);

			if (!$div.length) {
				// console.log("INIT TRAPS INFO-> TIMEOUT");
				setTimeout(function() {
					vis.binds["radar-trap"].trapsInfo.init(wid, view, data, style);
				}, 100);
				return;
			}
			// console.log("INIT TRAPS INFO", vis, data);

			data.attr("mapImages", {
				accidents: "icon-accident.png",
				fixedTraps: "icon-fixed-trap.png",
				fog: "icon-fog.png",
				mobileTraps: "icon-mobile-trap.png",
				objects: "icon-object.png",
				roadWorks: "icon-road-work.png",
				sleekness: "icon-sleekness.png",
				trafficJams: "icon-traffic-jam.png",
			});

			const stateIds = await new Promise((resolve) => {
				const route = data["route"].split("|")[1].trim();

				vis.conn._socket.emit("getObjectView", "system", "state", {startkey: "radar-trap", endkey: "radar-trap.\u9999"}, function(err, res) {
					// console.log("DEVICE Error", err);
					// console.log("DEVICE objectView", res);

					// const infoIds = vis.binds["radar-trap"].ids[data["route"].trim()];
					const infoIds = vis.binds["radar-trap"].ids[route];

					const stateIds = res.rows.reduce((ids, row) => {
						if (row.id.split(".")[3] === infoIds.trapsId) {
							ids.push(row.id);
						}

						return ids;
					}, []);

					resolve(stateIds);
				});
			});
			// console.log("STATEIDS", stateIds);

			const statesData = await new Promise((resolve) => {
				vis.conn.getStates(stateIds, (err, res) => {
					resolve(Object.fromEntries(Object.entries(res).map(([key, data]) => [key.split(".")[4], JSON.parse(data.val)])));
				});
			});
			// console.log("STATES", statesData);
			data.attr("statesData", statesData);

			vis.binds["radar-trap"].trapsInfo.bindListClickEventHandler($div);

			function onChange(...res) {
				// console.log("INSIDE ONCHANGE", res);

				const trapType = res[0].type.split(".")[4];
				// console.log("TRAP TYPE", trapType);

				data.attr("statesData").attr(trapType, JSON.parse(res[1]));

				setTimeout(() => vis.binds["radar-trap"].trapsInfo.bindListClickEventHandler($div), 0);
			}

			const bound = [];
			stateIds.forEach((stateId) => {
				// console.log(`${stateId}.val`);
				vis.states.bind(`${stateId}.val`, onChange);
				bound.push(`${stateId}.val`);
			});

			if (bound.length) {
				$div.data("bound", bound);
				$div.data("bindHandler", onChange);
			}

			if (!vis.editMode) {
				vis.conn.subscribe(stateIds);

				$div.data("destroy", (widget, $widget) => {
					// console.log("DESTROYED...");
					vis.conn.unsubscribe(stateIds);
				});
			}
		},
	},
};

vis.binds["radar-trap"].showVersion();
vis.binds["radar-trap"].initRadarTrap();
