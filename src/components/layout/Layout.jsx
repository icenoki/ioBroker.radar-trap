import React, {useContext} from "react";
import {Grid} from "@material-ui/core";
import {withStyles} from "@material-ui/core/styles";
import MainNavigation from "./MainNavigation";
import {NativeContext} from "../../App";
import Logo from "@iobroker/adapter-react/Components/Logo";

const styles = (_theme) => ({});

function Layout(props) {
	const {children} = props;
	const {native, that} = useContext(NativeContext);

	return (
		<>
			<Grid
				spacing={1}
				container
				direction="column"
			>
				<Grid item xs={12}>
					<header>
						<Logo
							instance={that.instance}
							common={that.common}
							native={native}
							onError={text => that.setState({errorText: text})}
							onLoad={that.onLoadConfig.bind(that)}
						/>
						<MainNavigation/>
					</header>
				</Grid>

				<Grid item xs={12}>
					{children}
				</Grid>
			</Grid>

			<footer>
				{that.renderError.bind(that)()}
				{that.renderToast.bind(that)()}
				{that.renderSaveCloseButtons.bind(that)()}
			</footer>
		</>
	);
}

export default withStyles(styles)(Layout);
