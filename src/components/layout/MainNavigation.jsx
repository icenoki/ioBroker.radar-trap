import React, {useContext} from "react";
import {Route, Link} from "react-router-dom";
import {Tabs, Tab, AppBar, Paper} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import I18n from "@iobroker/adapter-react/i18n";
import {NativeContext} from "../../App";

const styles = (_theme) => ({});

const routes = ["/settings-1", "/settings-2", "/settings-3"];

function MainNavigation() {
	const {isInTransition} = useContext(NativeContext);

	return (
		<Route path="/" render={(history) => (
			<AppBar position="relative">
				<Paper
					square
				>
					<Tabs
						value={history.location.pathname !== "/" ? history.location.pathname : false}
						indicatorColor="primary"
						textColor="primary"
						variant="fullWidth"
					>
						<Tab disabled={isInTransition} label={I18n.t("routes")} value={routes[0]} component={Link} to={routes[0]}/>
						<Tab label={I18n.t("maps")} value={routes[1]} component={Link} to={routes[1]}/>
						<Tab disabled={isInTransition} label={I18n.t("settings")} value={routes[2]} component={Link} to={routes[2]}/>
					</Tabs>
				</Paper>
			</AppBar>
		)}/>
	);
}

export default withStyles(styles)(MainNavigation);
