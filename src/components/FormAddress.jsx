import React from "react";
import I18n from "@iobroker/adapter-react/i18n";
import {Grid, Typography} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import FormInput from "./FormInput";

const styles = (_theme) => ({});

function FormAddress(props) {
	const {postfix, address} = props;

	return (
		<Grid container item xs={12} direction="column" alignItems="center" spacing={1}>
			<Typography variant="h6">
				{postfix === "ziel" ? "Ziel" : I18n.t(postfix)}
			</Typography>
			<Grid item xs={12}>
				<FormInput
					label={I18n.t("description")}
					name={`${postfix}.titel`}
					defaultValue={address?.titel}
				/>
			</Grid>
			<Grid item xs={12}>
				<FormInput
					label={I18n.t("country")}
					name={`${postfix}.land`}
					defaultValue={address?.land}
				/>
			</Grid>
			<Grid item xs={12}>
				<FormInput
					label={I18n.t("postcode")}
					name={`${postfix}.plz`}
					defaultValue={address?.plz}
				/>
			</Grid>
			<Grid item xs={12}>
				<FormInput
					label={I18n.t("location")}
					name={`${postfix}.ort`}
					defaultValue={address?.ort}
				/>
			</Grid>
			<Grid item xs={12}>
				<FormInput
					label={I18n.t("street")}
					name={`${postfix}.strasse`}
					defaultValue={address?.strasse}
				/>
			</Grid>
			<Grid item xs={12}>
				<FormInput
					label={I18n.t("house number")}
					name={`${postfix}.nummer`}
					defaultValue={address?.nummer}
				/>
			</Grid>
		</Grid>
	);
}

export default withStyles(styles)(FormAddress);
