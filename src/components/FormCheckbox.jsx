import React, {useEffect}  from "react";
import {useFormContext, useController} from "react-hook-form";
import {Checkbox} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";

const styles = (_theme) => ({});

function FormCheckbox(props) {
	const {name, defaultValue} = props;
	const {control, unregister} = useFormContext();

	const {field: {value, ref, onChange}} = useController({
		defaultValue: defaultValue,
		control: control,
		name: name,
	});

	useEffect(() => {
		return () => unregister(name);
	}, [unregister, name]);

	return <Checkbox
		size="small"
		onChange={onChange}
		checked={value}
		inputRef={ref}
	/>;
}

export default withStyles(styles)(FormCheckbox);
