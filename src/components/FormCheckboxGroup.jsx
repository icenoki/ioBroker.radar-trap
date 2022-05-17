import React from "react";
import I18n from "@iobroker/adapter-react/i18n";
import {withStyles} from "@material-ui/core/styles";
import FormCheckbox from "./FormCheckbox";
import {Grid, FormLabel, FormControl, FormGroup, FormControlLabel} from "@material-ui/core";

const styles = (_theme) => ({});

function FormCheckboxGroup(props) {
	const {title, profile, checks} = props;

	return (
		<Grid container item xs={12}>
			<FormControl margin="dense" component="fieldset">
				<FormLabel component="legend">{title}</FormLabel>
				<FormGroup>
					{
						Object.entries(checks).map((check, idx) => {
							return <FormControlLabel
								key={`${idx}-${profile}`}
								control={<FormCheckbox
									defaultValue={check[1]}
									name={`exclusion.${profile}.${check[0]}`}
								/>}
								label={I18n.t(check[0])}
							/>;
						})
					}
				</FormGroup>
			</FormControl>
		</Grid>
	);
}

export default withStyles(styles)(FormCheckboxGroup);
