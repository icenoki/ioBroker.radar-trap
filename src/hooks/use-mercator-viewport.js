import {useEffect, useCallback, useState} from "react";
import {WebMercatorViewport, FlyToInterpolator} from "react-map-gl";
import {easeCubic} from "d3-ease";

const useMercatorViewport = (box) => {
	const [viewport, setViewport] = useState({
		width: "100%",
		height: window.innerHeight - 208,
		longitude: 10.129808,
		latitude: 51.206213,
		zoom: 5,
	});

	const resetViewport = useCallback(() => {
		if (box.length === 0) {
			setViewport(ov => ({
				...ov,
				width: "100%",
				height: window.innerHeight - 208,
				longitude: 10.129808,
				latitude: 51.206213,
				zoom: 5,
				transitionDuration: "auto",
				transitionInterpolator: new FlyToInterpolator(),
				transitionEasing: easeCubic,
			}));
			return;
		}

		const {longitude, latitude, zoom} = new WebMercatorViewport({
			width: document.getElementById("trapMapContainer").clientWidth,
			height: document.getElementById("trapMapContainer").clientHeight,
		}).fitBounds(
			[[box[0], box[1]], [box[2], box[3]]], {
				padding: 10,
				offset: [0, 0],
			});

		setViewport(ov => ({
			...ov,
			longitude,
			latitude,
			zoom,
			transitionDuration: "auto",
			transitionInterpolator: new FlyToInterpolator(),
			transitionEasing: easeCubic,
		}));
	}, [box]);

	useEffect(() => {
		resetViewport();
		// return () => console.log("useMercatorViewport unmounting");
	}, [resetViewport]);

	return [viewport, setViewport, resetViewport];
};

export default useMercatorViewport;
