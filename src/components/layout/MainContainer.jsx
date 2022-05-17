import React from "react";
import {Container, Paper, Grid} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

const styles = (_theme) => ({
	root: {
		padding: _theme.spacing(0),
	},
});

const MainContainer = ({children, classes, ...props}) => {
	return (
		<Container
			className={classes.root}
			{...props}
		>
			<Paper square style={{height: "100%"}} elevation={0}>
				<Grid container direction="row">
					<Grid item xs={12}>
						{children}
					</Grid>
				</Grid>
			</Paper>
		</Container>
	);
};

export default withStyles(styles)(MainContainer);
