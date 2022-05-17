import React from "react";
import {useFormContext, useController} from "react-hook-form";
import {TextField} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

const styles = (_theme) => ({
	textField: {
		marginLeft: _theme.spacing(1),
		marginRight: _theme.spacing(1),
		width: "30ch",
	},
});

function FormInput(props) {
	const {name, label, defaultValue, classes} = props;
	const {control} = useFormContext();
	const {field: {ref, onChange, ...inputProps}, fieldState: {error}} = useController({
		name,
		control,
		defaultValue: defaultValue ? defaultValue : "",
	});

	return (
		<TextField
			size="small"
			{...inputProps}
			onChange={({target: {value}}) => onChange(value)}
			inputRef={ref}
			className={classes.textField}
			fullWidth
			label={label}
			variant="filled"
			error={!!error}
			helperText={error ? error.message : null}
		/>
	);
}

export default withStyles(styles)(FormInput);
