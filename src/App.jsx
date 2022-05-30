import React, {createContext, useContext} from "react";
import "mapbox-gl/dist/mapbox-gl.css";
import GenericApp from "@iobroker/adapter-react/GenericApp";
import {withStyles} from "@material-ui/core/styles";

import {Provider as FigbirdProvider} from "figbird";
import feathers from "@feathersjs/feathers";

const socketio = require("@feathersjs/socketio-client");
const io = require("socket.io-client");

const styles = (_theme) => ({});

const NativeContext = createContext({});

class App extends GenericApp {
	constructor(props) {
		const extendedProps = {
			...props,
			encryptedFields: [],
			translations: {
				"en": require("./i18n/en.json"),
				"de": require("./i18n/de.json"),
				"ru": require("./i18n/ru.json"),
				"pt": require("./i18n/pt.json"),
				"nl": require("./i18n/nl.json"),
				"fr": require("./i18n/fr.json"),
				"it": require("./i18n/it.json"),
				"es": require("./i18n/es.json"),
				"pl": require("./i18n/pl.json"),
				"zh-cn": require("./i18n/zh-cn.json"),
			},
		};
		super(props, extendedProps);

		this.state = {...this.state, ...{renewTimer: {}}, ...{isInTransition: false}};
	}

	onConnectionReady() {
		// console.log("Here we are...");
		// const socket = io.connect(`http://${document.domain}:${this.savedNative["feathersPort"]}`);
		// const socket = io.connect(`https://ibrtest.whew.synology.me:3030`);

		if (this.savedNative["httpsEnabled"] === true) {
			const socket = io.connect(`https://${document.domain}:${this.savedNative["feathersPort"]}`, {rejectUnauthorized: false});
			this.client.configure(socketio(socket, {timeout: 120000}));
		} else {
			const socket = io.connect(`http://${document.domain}:${this.savedNative["feathersPort"]}`, {rejectUnauthorized: false});
			this.client.configure(socketio(socket, {timeout: 120000}));
		}

		this.socket.subscribeState("*.timer", false, (id, state) => {
			if (state === null) {
				this.socket.unsubscribeState(id, null);
				const routeId = id.split(".")[2];
				this.setState({renewTimer: {...Object.fromEntries(Object.entries(this.state.renewTimer).filter(([key]) => key !== routeId))}});
			} else {
				const routeId = id.split(".")[2];
				this.setState({renewTimer: {...this.state.renewTimer, ...{[routeId]: state.val}}});
			}
		});
	}

	onSave(isClose) {
		if (this.savedNative.httpsEnabled === this.state.native.httpsEnabled && this.savedNative.feathersPort === this.state.native.feathersPort) {
			super.onSave(isClose);
		} else {
			super.onSave(true);
		}
	}

	componentDidMount() {
		this.client = feathers();
	}

	componentWillUnmount() {
		this.socket.unsubscribeState("*.timer", () => {
		});
	}

	render() {
		if (!this.state.loaded) {
			return super.render();
		}

		const {children} = this.props;

		const context = {
			that: this,
			native: this.state.native,
			renewTimer: this.state.renewTimer,
			isInTransition: this.state.isInTransition,
			updateNativeValue: this.updateNativeValue.bind(this),
		};

		return (
			<FigbirdProvider feathers={this.client}>
				<NativeContext.Provider value={context}>
					{children}
				</NativeContext.Provider>
			</FigbirdProvider>
		);
	}

}

export default withStyles(styles)(App);
export {NativeContext};
export const useNativeContext = () => useContext(NativeContext);
