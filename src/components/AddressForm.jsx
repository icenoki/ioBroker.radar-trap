import React from "react";
import I18n from "@iobroker/adapter-react/i18n";
import {useForm, FormProvider} from "react-hook-form";
import {Typography, Button, Dialog, Grid} from "@material-ui/core";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import {LinearProgress, Divider} from "@material-ui/core";
import * as yup from "yup";
import {yupResolver} from "@hookform/resolvers/yup";
import FormAddress from "./FormAddress";
import FormInput from "./FormInput";
import FormCheckboxGroup from "./FormCheckboxGroup";
import FormRadioGroup from "./FormRadioGroup";
import {withStyles} from "@material-ui/core/styles";
import {useGet, useMutation} from "figbird";

const styles = (_theme) => ({
	root: {
		textAlign: "center",
		margin: 0,
		padding: _theme.spacing(2),
	},
	closeButton: {
		position: "absolute",
		right: _theme.spacing(1),
		top: _theme.spacing(2),
		color: _theme.palette.grey[500],
	},
});

const DialogTitle = withStyles(styles)((props) => {
	const {children, classes, onClose, status, ...other} = props;
	return (
		<MuiDialogTitle
			disableTypography
			className={classes.root} {...other}
		>
			<Typography variant="h4">{children}</Typography>
			<IconButton
				disabled={status === "loading"}
				className={classes.closeButton} onClick={onClose}>
				<CloseIcon/>
			</IconButton>
		</MuiDialogTitle>
	);
});

const DialogContent = withStyles((theme) => ({
	root: {
		padding: theme.spacing(2),
	},
}))(MuiDialogContent);

const DialogActions = withStyles((theme) => ({
	root: {
		margin: 0,
		padding: theme.spacing(2),
	},
}))(MuiDialogActions);

function isObject(it) {
	return Object.prototype.toString.call(it) === "[object Object]";
}

const schema = yup.lazy(obj => {
	return yup.object().shape(
		Object.entries(obj).filter(([key, value]) => key !== "exclusion" && isObject(value)).reduce(
			(a, [key]) => {
				return ({
					...a,
					[key]: yup.object().shape({
						titel: yup.string()
							.matches(/^[\s\w\-\u00C0-\u017F]+$/, "Erlaubt sind a-z, A-Z, 0-9, _, - und Leerzeichen.")
							.required("Bezeichnung ist ein Pflichtfeld"),
						land: yup.string().matches(/^[\s\w\-\u00C0-\u017F]+$/, "Erlaubt sind a-z, A-Z, 0-9, _, - und Leerzeichen.").required("Land ist ein Pflichtfeld"),
						plz: yup.string().matches(/^([0][1-9]|[1-9][0-9])[0-9]{3}$/, "Kein gültiges PLZ-Format.").required("PLZ ist ein Pflichtfeld"),
						ort: yup.string().matches(/^[\s\w\-\u00C0-\u017F]+$/, "Erlaubt sind a-z, A-Z, 0-9, _, - und Leerzeichen.").required("Ort ist ein Pflichtfeld"),
						strasse: yup.string()
							.matches(/^[\s\w\-\u00C0-\u017F]+$/, "Erlaubt sind a-z, A-Z, 0-9, _, - und Leerzeichen.")
							.required("Strasse ist ein Pflichtfeld"),
					}),
				});
			},
			{
				duration: yup.string()
					.min(0.5, "Refreshzyklus muss mindestens 30 Sek. sein.")
					.max(1440, "Refreshzyklus muss kleiner als 24 Std. sein.")
					.required("Refreshzyklus ist ein Pflichtfeld"),
			}),
	);
});

/*const schema = yup.object().shape({
	start: yup.object().shape({
		ort: yup.string().required("Ort ist ein Pflichtfeld"),
	}),
	ziel: yup.object().shape({
		ort: yup.string().required("Ort ist ein Pflichtfeld"),
	}),
});*/

const AddressForm = (props) => {
	const {open, setOpen, routeId} = props;

	const methods = useForm({mode: "onChange", resolver: yupResolver(schema)});
	const {handleSubmit, watch, formState: {isValid}} = methods;

	const {patch: patchRoute, status: patchRouteStatus} = useMutation("routes");
	const {status: routeStatus, data: route} = useGet("routes", routeId, {query: {$select: ["_id", "start", "ziel", "settings"]}});

	const profile = watch("profile");

	const closeHandler = (...data) => {
		if (data[1] !== "backdropClick") {
			setOpen(false);
		}
	};

	const submitHandler = async data => {
		// console.log("DATA IN SUBMITHANDLER: ", data);

		try {
			await patchRoute(routeId, {
				"start": {
					...Object.fromEntries(Object.entries(data.start).map(([key, value]) => [key, value.trim()])),
					geometry: route.start.geometry,
				},
				"ziel": {
					...Object.fromEntries(Object.entries(data.ziel).map(([key, value]) => [key, value.trim()])),
					geometry: route.ziel.geometry,
				},
				"settings": {
					"exclusion": {
						...route.settings.exclusion,
						[`${data.profile}`]: data.exclusion !== undefined ? data.exclusion[data.profile] : {},
					},
					"profile": data.profile,
					"duration": data.duration.trim(),
				},
			});
		} catch (err) {
			// console.log("patchRoute", err);
		}

		(patchRouteStatus === "success" || patchRouteStatus === "idle") && setOpen(false);
	};

	return (
		<Dialog
			disableEscapeKeyDown={patchRouteStatus === "loading"}
			maxWidth="md"
			open={open}
			onClose={closeHandler}
		>
			<FormProvider {...methods}>
				<form onSubmit={handleSubmit(submitHandler)}
					style={{marginBlockEnd: 0}}
				>
					<DialogTitle onClose={closeHandler} status={patchRouteStatus}>{I18n.t("edit route")}</DialogTitle>
					<DialogContent dividers>
						<Grid container justifyContent="center">
							<Grid item xs={6}>
								{routeStatus === "success" &&
									<FormAddress postfix="start" address={route.start}/>}
							</Grid>
							<Grid item xs={6}>
								{routeStatus === "success" &&
									<FormAddress postfix="ziel" address={route.ziel}/>}
							</Grid>
						</Grid>
						<Divider style={{margin: "10px 0"}}/>
						<Grid container justifyContent="center">
							{routeStatus === "success" && <FormInput
								label={I18n.t("refresh cycle in minutes")}
								name="duration"
								defaultValue={route.settings.duration}
							/>}
						</Grid>
						<Divider style={{margin: "10px 0"}}/>
						<Grid container justifyContent="space-around">
							<Grid item xs={4}>
								{routeStatus === "success" &&
									<FormRadioGroup title={I18n.t("profile")} defaultValue={profile || route.settings.profile} radios={route.settings.exclusion}/>}
							</Grid>
							<Grid item xs={4}>
								{routeStatus === "success" && profile !== "walking" &&
									<FormCheckboxGroup title={I18n.t("exclusions")} profile={profile || route.settings.profile} checks={route.settings.exclusion[profile || route.settings.profile]}/>}
							</Grid>
						</Grid>
					</DialogContent>
					<DialogActions>
						{patchRouteStatus === "loading" &&
							<div style={{width: "100%"}}>
								<LinearProgress/>
							</div>}
						<Button
							disabled={patchRouteStatus === "loading" || !isValid}
							type="submit"
							/*variant="contained">Ok: {JSON.stringify(isValid)}</Button>*/
							variant="contained">Ok</Button>
					</DialogActions>
				</form>
			</FormProvider>
		</Dialog>
	);
};

export default withStyles(styles)(AddressForm);
