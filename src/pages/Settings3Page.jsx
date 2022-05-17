import React from "react";
import {Grid, Paper, Link} from "@material-ui/core";
import IbrInput from "../components/ibr/IbrInput";
import {withStyles} from "@material-ui/core/styles";

const styles = (_theme) => ({
	underlineAlways: {
		color: _theme.palette.primary.main,
		textTransform: "none",
		"&:hover" : {
			color: _theme.palette.primary.dark,
		}
	},
	grid: {
		padding: _theme.spacing(1),
		marginTop: _theme.spacing(2),
	},
});

function Settings3Page({classes}) {
	return (
		<Grid container justifyContent="center">
			<Grid className={classes.grid} component={Paper} variant="elevation" elevation={4} item xs={11}>
				<Grid item xs={2}>
					<IbrInput title="Feathers Port" attr="feathersPort" type="text"/>
				</Grid>
				<Grid item xs={12}>
					<IbrInput title="Mapbox Token" attr="mbxAccessToken" type="text"/>
					<Link
						classes={{underlineAlways: classes.underlineAlways}}
						variant="body2"
						target="_blank"
						rel="noopener"
						underline="always"
						href="https://mapbox.com"
					>Mapbox Token bekommen</Link>
				</Grid>
				<Grid item xs={12}>
					<IbrInput title="OpenCage ID" attr="opencageId" type="text"/>
					<Link
						classes={{underlineAlways: classes.underlineAlways}}
						variant="body2"
						target="_blank"
						rel="noopener"
						underline="always"
						href="https://opencagedata.com"
					>OpenCage ID bekommen</Link>
				</Grid>
			</Grid>
		</Grid>);
}

export default withStyles(styles)(Settings3Page);
