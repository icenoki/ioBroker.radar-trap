const mapStyles = {
	route: {
		id: "route",
		type: "line",
		layout: {
			"line-join": "round",
			"line-cap": "round",
		},
		paint: {
			"line-color": "#9C27B0",
			"line-width": 5,
			"line-opacity": 0.8,
		},
	},
	traps: {
		id: "traps",
		type: "symbol",
		// filter: ["match", ["get", "type_name"], "fixed-trap", true, false],
		layout: {
			"icon-allow-overlap": true,
			"icon-image": [
				"match", ["get", "type_name"],
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
			"icon-color": "#263238",
			"icon-opacity": 0.7,
		},
	},
	clusterTraps: {
		id: "cluster-traps",
		type: "circle",
		filter: ["has", "point_count"],
		paint: {
			"circle-color": ["step", ["get", "point_count"], "#E1BEE7", 100, "#E1BEE7", 750, "#E1BEE7"],
			"circle-radius": ["step", ["get", "point_count"], 15, 2, 15],
		},
	},
	clusterTrapsCount: {
		id: "cluster-traps-count",
		type: "symbol",
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
		filter: ["has", "linetrap"],
		layout: {
			"line-join": "round",
			"line-cap": "round",
		},
		paint: {
			"line-color": "#ff0000",
			"line-width": 9,
			"line-opacity": 1,
			"line-dasharray": [1, 1.5],
		},
	},
};

export default mapStyles;
