import React, {useEffect, useState} from "react";
import {Box, Fab, CircularProgress, Typography} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

const styles = (_theme) => ({
	root: {
		boxShadow: "none",
		"&:hover": {
			cursor: "pointer",
			textDecoration: "none",
			backgroundColor: "#c5c5c5",
		},
	},
});

const toHHMMSS = (secs) => {
	const hours = Math.floor(this / 3600) < 10 ? ("00" + Math.floor(secs / 3600)).slice(-2) : Math.floor(secs / 3600);
	const minutes = ("00" + Math.floor((secs % 3600) / 60)).slice(-2);
	const seconds = ("00" + (secs % 3600) % 60).slice(-2);
	return hours + ":" + minutes + ":" + seconds;
};

function CircularProgressWithLabel({classes, ...props}) {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		setProgress(Math.round((1 - (props.value / (props.duration * 60))) * 100));
	}, [props.value, props.duration]);

	return (
		<Fab
			className={classes.root}
			onClick={props.onClick}
			size="large"
			disabled={props.renewing}
		>
			<CircularProgress
				size={56}
				thickness={1.6} variant={props.renewing === true ? "indeterminate" : "determinate"} value={progress}
			/>
			<Box
				component={Typography}
				variant="caption"
				sx={{
					top: 2,
					left: 0,
					bottom: 0,
					right: 0,
					position: "absolute",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				{toHHMMSS(props.value)}
			</Box>
		</Fab>
	);
}

export default withStyles(styles)(CircularProgressWithLabel);
