import React from "react";
import I18n from "@iobroker/adapter-react/i18n";
import {withStyles} from "@material-ui/core/styles";
import {Radio, RadioGroup, FormControl, FormLabel, FormControlLabel, Tooltip} from "@material-ui/core";
import {useController, useFormContext} from "react-hook-form";

const styles = (_theme) => ({});

function FormRadioGroup(props) {
	const {title, radios, defaultValue} = props;
	const {control} = useFormContext();
	const {field: {value, onChange}} = useController({
		name: "profile",
		control,
		defaultValue,
	});

	return (
		<FormControl component="fieldset" margin="dense">
			<FormLabel component="legend">{title}</FormLabel>
			<RadioGroup onChange={onChange} value={value}>
				{
					Object.keys(radios).map((radio, idx) =>
						<Tooltip key={idx} title={I18n.t(radio)} placement="top">
							<FormControlLabel
								label={radio}
								control={<Radio size="small" color="primary" value={radio}/>}
							/>
						</Tooltip>)
				}
			</RadioGroup>
		</FormControl>
	);
}

export default withStyles(styles)(FormRadioGroup);
