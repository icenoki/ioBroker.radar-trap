import React from "react";
import {withStyles} from "@material-ui/core/styles";
import {Grid, Paper, Fab, FormControl, InputLabel, Select, MenuItem} from "@material-ui/core";
import {useFind} from "figbird";
import {ZoomOutMap} from "@material-ui/icons";
import I18n from "@iobroker/adapter-react/i18n";

const styles = (_theme) => ({
	cardControl: {
		padding: _theme.spacing(1),
		opacity: 0.75,
	},
	selectBg: {
		background: _theme.palette.primary.main,
	},
});

function SelectRoute(props) {
	const {classes, settings} = props;

	const {status: routesStatus, data: routes} = useFind("routes");

	const changeHandler = (e) => {
		settings.setSelectedRoute(e.target.value);
	};

	return (
		<Grid container justifyContent="space-between" className={classes.cardControl}>
			<Grid item xs={3}>
				<FormControl
					component={Paper}
					elevation={4}
					size="small"
					fullWidth
					variant="outlined"
				>
					<InputLabel>Route</InputLabel>
					<Select
						style={{borderStyle: "hidden"}}
						className={classes.selectBg}
						label={I18n.t("route")}
						value={settings.selectedRoute}
						onChange={changeHandler}
					>
						<MenuItem value="none"><em>None</em></MenuItem>

						{routesStatus === "success" && routes.map(route => {
							return <MenuItem
								key={route._id}
								value={route._id}
							>
								{route.start.titel} nach {route.ziel.titel}
							</MenuItem>;
						})}
					</Select>
				</FormControl>
			</Grid>
			<Grid item>
				<Fab style={{opacity: 0.9}} size="medium" color="primary" onClick={settings.resetViewport}>
					<ZoomOutMap/>
				</Fab>
			</Grid>
		</Grid>
	);
}

export default withStyles(styles)(SelectRoute);
