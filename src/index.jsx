import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Route, Switch, Redirect} from "react-router-dom";
import {MuiThemeProvider} from "@material-ui/core/styles";
import MainContainer from "./components/layout/MainContainer";
import theme from "@iobroker/adapter-react/Theme";
import Utils from "@iobroker/adapter-react/Components/Utils";
import App from "./App";

import Layout from "./components/layout/Layout";
import Settings1Page from "./pages/Settings1Page";
import Settings2Page from "./pages/Settings2Page";
import Settings3Page from "./pages/Settings3Page";

let themeName = Utils.getThemeName();

function build() {
	ReactDOM.render(
		<MuiThemeProvider theme={theme(themeName)}>
			<MainContainer maxWidth="xl">
				<App
					adapterName="radar-trap"
					onThemeChange={(_theme) => {
						themeName = _theme;
						build();
					}}
				>
					<BrowserRouter>
						<Redirect from="/" to="/settings-1" exact/>
						<Layout>
							<Switch>
								<Route path="/settings-1" exact component={Settings1Page}/>
								<Route path="/settings-2" exact component={Settings2Page}/>
								<Route path="/settings-3" exact component={Settings3Page}/>
							</Switch>
						</Layout>
					</BrowserRouter>
				</App>
			</MainContainer>
		</MuiThemeProvider>,
		document.getElementById("root"),
	);
}

build();
