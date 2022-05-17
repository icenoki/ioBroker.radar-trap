import React from "react";
import {Grid} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

import RoutesTable from "../components/RoutesTable";

const styles = (_theme) => ({
	root: {
		padding: _theme.spacing(0),
		marginTop: _theme.spacing(2),
	},
});

function Settings1Page({classes}) {

	return (
		<Grid container direction="column">
			<Grid className={classes.root} item xs={12}>
				<RoutesTable/>
			</Grid>
		</Grid>
	);
}

export default withStyles(styles)(Settings1Page);
