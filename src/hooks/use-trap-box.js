import {useEffect, useState} from "react";
import bbox from "@turf/bbox";

const useTrapBox = (directionStatus, direction) => {
	const [trapBox, setTrapBox] = useState([]);

	useEffect(() => {
		// console.log("useTrapBox->useEffect");

		if (directionStatus !== "success" || direction.length === 0) {
			setTrapBox([]);
			// console.log("directionLength", direction);
			return;
		}

		// console.log("directionStatus", directionStatus);
		// console.log("direction", direction);

		const box = bbox(direction[0].directionLine);
		setTrapBox(box);

		// return () => console.log("useTrapBox unmounting");
	}, [directionStatus, direction]);

	return trapBox;
};

export default useTrapBox;
