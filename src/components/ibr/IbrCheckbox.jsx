import React, {Component} from "react";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import {withStyles} from "@material-ui/core/styles";
import I18n from "@iobroker/adapter-react/i18n";

import {NativeContext} from "../../App";

const styles = (_theme) => ({});

class IbrCheckbox extends Component {
	static contextType = NativeContext;

	render() {
		const {native, updateNativeValue} = this.context;
		const {attr, title} = this.props;

		return (
			<FormControlLabel
				key={attr}
				control={
					<Checkbox
						checked={native[attr]}
						onChange={() => updateNativeValue(attr, !native[attr])}
						color="primary"
					/>
				}
				label={I18n.t(title)}
			/>
		);
	}
}

export default withStyles(styles)(IbrCheckbox);
