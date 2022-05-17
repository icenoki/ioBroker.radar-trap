import React from "react";
import {Grid} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import TrapMap from "../components/TrapMap";

const styles = (_theme) => ({});

function Settings2Page() {
	return (
		<Grid container justifyContent="center">
			<Grid item xs={12}>
				<TrapMap/>
			</Grid>
		</Grid>
	);
}

export default withStyles(styles)(Settings2Page);
