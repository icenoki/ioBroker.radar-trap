import React, {Component} from "react";
import TextField from "@material-ui/core/TextField";
import {withStyles} from "@material-ui/core/styles";
import I18n from "@iobroker/adapter-react/i18n";

import {NativeContext} from "../../App";

const styles = (_theme) => ({
	textField: {
		marginLeft: _theme.spacing(0),
		marginRight: _theme.spacing(0),
	},
});

class IbrInput extends Component {
	static contextType = NativeContext;

	render() {
		const {classes} = this.props;
		const {native, updateNativeValue} = this.context;
		const {attr, type, title} = this.props;

		return (
			<TextField
				className={classes.textField}
				label={I18n.t(title)}
				fullWidth
				variant="filled"
				value={native[attr]}
				type={type || "text"}
				onChange={(e) => updateNativeValue(attr, e.target.value)}
				margin="dense"
			/>
		);
	}

}

export default withStyles(styles)(IbrInput);
