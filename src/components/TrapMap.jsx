import React, {useState, useContext, useEffect, useRef, useCallback} from "react";
import {Grid} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import TrapInfo from "./TrapInfo";
import SelectRoute from "./SelectRoute";
import useTrapBox from "../hooks/use-trap-box";
import useMercatorViewport from "../hooks/use-mercator-viewport";
import {feature, featureCollection} from "@turf/helpers";
import mapStyles from "../helper/mapStyles";
import MapGL, {Source, Layer, Popup, FlyToInterpolator} from "react-map-gl";
import {useFind} from "figbird";
import {easeCubic} from "d3-ease";
import {NativeContext} from "../App";

import iconFixedTrap from "../assets/map-icons/icon-fixed-trap.png";
import iconAccident from "../assets/map-icons/icon-accident.png";
import iconFog from "../assets/map-icons/icon-fog.png";
import iconMobileTrap from "../assets/map-icons/icon-mobile-trap.png";
import iconObject from "../assets/map-icons/icon-object.png";
import iconRoadWork from "../assets/map-icons/icon-road-work.png";
import iconSleekness from "../assets/map-icons/icon-sleekness.png";
import iconTrafficJam from "../assets/map-icons/icon-traffic-jam.png";
import iconWrongWayDriver from "../assets/map-icons/icon-wrong-way-driver.png";

const styles = (_theme) => ({});

function isArray(it) {
	if (typeof Array.isArray === "function") return Array.isArray(it);
	return Object.prototype.toString.call(it) === "[object Array]";
}

function TrapMap() {
	const {that} = useContext(NativeContext);
	const [trapsData, setTrapsData] = useState(null);
	const [hoverInfo, setHoverInfo] = useState(null);
	const [selectedRoute, setSelectedRoute] = useState("none");

	const mapRef = useRef(null);

	const {status: routeStatus, data: route} = useFind("routes", {query: selectedRoute === "none" ? {_id: ""} : {_id: selectedRoute}});
	// console.log("routeStatus, route", routeStatus, route);

	const {status: directionStatus, data: direction} = useFind("directions",
		{query: route && routeStatus === "success" && route.length !== 0 ? {routeId: route[0]._id} : {routeId: ""}});
	// console.log("directionStatus, direction", directionStatus, direction);

	const {status: trapsStatus, data: traps} = useFind("traps",
		{query: route && routeStatus === "success" && route.length !== 0 ? {routeId: route[0]._id} : {routeId: ""}});
	// console.log("trapsStatus, traps", trapsStatus, traps);

	const trapBox = useTrapBox(directionStatus, direction);
	const [viewport, setViewport, resetViewport] = useMercatorViewport(trapBox);

	useEffect(() => {
		if (trapsStatus === "success" && traps.length !== 0) {
			// console.log("TRAPS", traps);
			setTrapsData(featureCollection(...traps.map(trap =>
				Object.values(trap).reduce((list, t) => {
					if (isArray(t)) {
						// console.log("t is object", t);
						const lineTraps = t.filter(obj => obj.properties.polyline !== "").map(obj => obj.properties.polyline);
						// console.log("lineTraps", lineTraps);
						return [...list, ...t, ...lineTraps];
					}
					return list;
				}, []))));
		} else {
			setTrapsData(null);
		}
	}, [traps, trapsStatus]);

	useEffect(() => {
		let resizeTimer;

		const handleResize = () => {
			clearTimeout(resizeTimer);
			resizeTimer = setTimeout(function() {
				resetViewport();
			}, 250);

			setViewport(ov => ({
				...ov,
				width: "100%",
				height: window.innerHeight - 208,
			}));
		};

		window.addEventListener("resize", handleResize);
		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [resetViewport, setViewport]);

	/*useEffect(() => {
		[
			"icon-fixed-trap",
			"icon-mobile-trap",
			"icon-traffic-jam",
			"icon-road-work",
			"icon-accident",
			"icon-object",
			"icon-sleekness",
			"icon-fog",
			"icon-wrong-way-driver",
		].forEach(image => {
			if (!mapRef.current.getMap().hasImage(image)) {
				mapRef.current.getMap().loadImage((process.env.PUBLIC_URL + `/map-icons/${image}.png`), (error, mapimage) => {
					if (error) throw error;

					mapRef.current.getMap().addImage(image, mapimage, {"sdf": true});
				});
			}
		});
	}, [mapRef]);*/

	useEffect(() => {
		[
			{id: "icon-fixed-trap", png: iconFixedTrap},
			{id: "icon-mobile-trap", png: iconMobileTrap},
			{id: "icon-traffic-jam", png: iconTrafficJam},
			{id: "icon-road-work", png: iconRoadWork},
			{id: "icon-accident", png: iconAccident},
			{id: "icon-object", png: iconObject},
			{id: "icon-sleekness", png: iconSleekness},
			{id: "icon-fog", png: iconFog},
			{id: "icon-wrong-way-driver", png: iconWrongWayDriver},
		].forEach(image => {
			if (!mapRef.current.getMap().hasImage(image.id)) {
				mapRef.current.getMap().loadImage(image.png, (error, mapimage) => {
					if (error) throw error;

					mapRef.current.getMap().addImage(image.id, mapimage, {"sdf": true});
				});
			}
		});
	}, [mapRef]);

	const onHover = useCallback(event => {
		const properties = event.features.length !== 0 && event.features[0].properties;

		if (!properties || properties.cluster) {
			setHoverInfo(null);
		} else {
			const info = properties.info !== "false" && JSON.parse(properties.info);

			setHoverInfo({
				longitude: event.lngLat[0],
				latitude: event.lngLat[1],
				typeText: properties.type_text,
				street: properties.street,
				vmax: properties.vmax && properties.vmax !=="?" && properties.vmax,
				createDate: properties.create_date !== "0000-00-00 00:00:00" && properties.create_date,
				confirmDate: properties.confirm_date !== "0000-00-00 00:00:00" && properties.confirm_date,
				reason: info && info.reason && info.reason,
				length: info && info.length && info.length,
				duration: info && info.duration && Math.round(+info.duration / 60),
				delay: info && info.delay && Math.round(+info.delay / 60),
			});
		}
	}, []);

	const onClick = event => {
		if (!event.features.length || !event.features[0].properties.cluster_id) return;

		const feature = event.features[0];
		const clusterId = feature.properties.cluster_id;
		const sourceId = feature.source;

		const mapboxSource = mapRef.current.getMap().getSource(sourceId);

		mapboxSource.getClusterExpansionZoom(clusterId, (err, zoom) => {
			if (err) {
				return;
			}

			setViewport({
				...viewport,
				longitude: feature.geometry.coordinates[0],
				latitude: feature.geometry.coordinates[1],
				zoom,
				transitionDuration: "auto",
				transitionInterpolator: new FlyToInterpolator(),
				transitionEasing: easeCubic,
				//transitionDuration: 500,
			});
		});
	};

	const interactionStateChangeHandler = (interactions) => {
		that.setState({...that.state, ...{isInTransition: interactions.inTransition}});
	};

	return (
		<Grid container justifyContent="center" id="trapMapContainer">
			<Grid item xs={12}>
				<MapGL
					{...viewport}
					onInteractionStateChange={interactionStateChangeHandler}
					mapboxApiAccessToken={that.savedNative.mbxAccessToken}
					mapStyle="mapbox://styles/mapbox/streets-v11"
					onViewportChange={setViewport}
					interactiveLayerIds={(trapsData !== null && ["cluster-traps", "traps"]) || []}
					onClick={onClick}
					onHover={onHover}
					ref={mapRef}
					attributionControl={false}
				>
					<SelectRoute
						settings={{selectedRoute, setSelectedRoute, resetViewport}}
					/>

					{hoverInfo !== null && (
						<Popup
							anchor="top"
							longitude={hoverInfo.longitude}
							latitude={hoverInfo.latitude}
							closeButton={false}
						>
							<TrapInfo info={hoverInfo}/>
						</Popup>
					)}

					{directionStatus === "success" && direction.length !== 0 &&
						<Source type="geojson" data={feature(direction[0].directionLine)}>
							<Layer {...mapStyles.route} />
						</Source>}

					{trapsData !== null &&
						<Source
							type="geojson"
							data={trapsData}
						>
							<Layer {...mapStyles.lineTraps} />
						</Source>}

					{trapsData !== null &&
						<Source
							type="geojson"
							data={trapsData}
							cluster={true}
							clusterMaxZoom={14}
							clusterRadius={50}
						>
							<Layer {...mapStyles.traps} />
							<Layer {...mapStyles.clusterTraps} />
							<Layer {...mapStyles.clusterTrapsCount} />
						</Source>}
				</MapGL>
			</Grid>
		</Grid>
	);
}

export default withStyles(styles)(TrapMap);
