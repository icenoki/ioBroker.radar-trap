import React, {useState, useContext} from "react";
import {Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper} from "@material-ui/core";
import {useFind, useMutation} from "figbird";
import {withStyles} from "@material-ui/core/styles";

import I18n from "@iobroker/adapter-react/i18n";

import AddressForm from "./AddressForm";
import {Button} from "@material-ui/core";
import {IconButton} from "@material-ui/core";
import {Create, Delete} from "@material-ui/icons";
import {paramsForServer} from "feathers-hooks-common";

import CircularProgressWithLabel from "./CircularProgressWithLabel";

import {NativeContext} from "../App";

const styles = (_theme) => ({});

const route = {
	start: {titel: "", land: "", plz: "", ort: "", strasse: "", nummer: "", geometry: {lat: "", lng: ""}},
	ziel: {titel: "", land: "", plz: "", ort: "", strasse: "", nummer: "", geometry: {lat: "", lng: ""}},
	settings: {
		exclusion: Object.fromEntries(new Map([
			["driving", {toll: false, ferry: false, motorway: false}],
			["driving-traffic", {toll: false, ferry: false, motorway: false}],
			["cycling", {ferry: false}],
			["walking", {}],
		])),
		profile: "driving",
		fixedTraps: false,
		mobileTraps: false,
		roadWorks: false,
		trafficJams: false,
		sleekness: false,
		accidents: false,
		fog: false,
		objects: false,
		duration: "30",
	},
};

function RoutesTable() {
	const {renewTimer} = useContext(NativeContext);
	const [open, setOpen] = useState(false);
	const [routeId, setRouteId] = useState(null);

	const {create: createRoute, remove: removeRoute} = useMutation("routes");
	const {status:statusRoutes, data: routes} = useFind("routes", {realtime: "refetch"});

	const {status: statusTraps, update: updateTraps} = useMutation("traps");

	const addressHandler = (id) => {
		setRouteId(id);
		setOpen(true);
	};

	const renewHandler = (route) => {
		// console.log("route", route);
		// console.log("PARAMSFROMSERVER", paramsForServer({from: "renew-handler"}));
		setRouteId(route._id);
		route.traps && updateTraps(route.traps._id, {routeId: route._id, directionId: route.direction._id, profile: route.settings.profile},
			paramsForServer({from: "renew-handler"}));
	};

	return (
		<>
			{
				open && <AddressForm
					open={open}
					setOpen={setOpen}
					routeId={routeId}
				/>
			}
			<Grid container direction="column" alignItems="center" spacing={2}>
				<Grid item>
					<Button
						onClick={() => createRoute(route)}
						variant="contained"
						color="primary"
					>
						{I18n.t("add route")}
					</Button>
				</Grid>
				{
					statusRoutes === "success" && routes.length !== 0 &&
					<Grid item container justifyContent="center">
						<Grid item xs={12} md={6}>
							<TableContainer component={Paper} variant="elevation" elevation={4}>
								<Table size="small">
									<TableHead>
										<TableRow>
											<TableCell align="center"><b>{I18n.t("edit")}</b></TableCell>
											<TableCell align="center"><b>{I18n.t("renew")}</b></TableCell>
											<TableCell align="left"><b>{I18n.t("start")}</b></TableCell>
											<TableCell align="left"><b>{I18n.t("target")}</b></TableCell>
											<TableCell align="center"><b>{I18n.t("delete")}</b></TableCell>
										</TableRow>
									</TableHead>

									<TableBody>
										{statusRoutes === "success" && routes.map((route) => (
											<TableRow key={route._id}>
												<TableCell align="center">
													<IconButton
														disabled={statusTraps === "loading"}
														onClick={() => addressHandler(route._id)}
														component="span"
													>
														<Create/>
													</IconButton>
												</TableCell>

												<TableCell align="center">
													{renewTimer[route._id] !== undefined && <CircularProgressWithLabel
														onClick={() => renewHandler(route)}
														renewing={(statusTraps === "loading" && routeId === route._id) || renewTimer[route._id] === 0}
														// renewing={(statusTraps === "loading") || renewTimer[route._id] === 0}
														value={renewTimer[route._id]}
														duration={route.settings.duration}/>}
												</TableCell>

												<TableCell>
													{route.start.titel || I18n.t("name for the starting point")}
												</TableCell>

												<TableCell>
													{route.ziel.titel || I18n.t("name for the target point")}
												</TableCell>

												<TableCell align="center">
													<IconButton
														disabled={statusTraps === "loading"}
														onClick={() => removeRoute(route._id)}
													>
														<Delete/>
													</IconButton>
												</TableCell>
											</TableRow>
										))}
									</TableBody>

								</Table>
							</TableContainer>
						</Grid>
					</Grid>
				}
			</Grid>
		</>
	);
}

export default withStyles(styles)(RoutesTable);
