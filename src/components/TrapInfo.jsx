import * as React from "react";
import {Box, Card, CardHeader, CardContent, Typography} from "@material-ui/core";
import {makeStyles} from "@material-ui/core/styles";

const cardHeaderStyles = makeStyles(theme => ({
	title: {
		backgroundColor: theme.palette.primary.main,
		margin: 0,
		padding: "0 4px",
		"& .MuiTypography-h5": {fontSize: "1.2rem"},
		textAlign: "center",
	},
}));

const cardContentStyles = makeStyles(theme => ({
	root: {
		marginBottom: -24,
		padding: "0 8px",
	},
}));

function TrapInfo({info}) {
	const cardHeaderClasses = cardHeaderStyles();
	const cardContentClasses = cardContentStyles();

	return (
		<Box sx={{margin: "-10px -10px -15px -10px", padding: 0, minWidth: 200}}>
			<Card variant="elevation" elevation={6}>
				<Box component="div" sx={{borderBottom: "2px solid black"}}>
					<CardHeader className={cardHeaderClasses.title} title={info.typeText}/>
				</Box>
				<CardContent className={cardContentClasses.root}>
					{info.street && <Typography variant="subtitle2"><b>Ort: </b>{info.street}</Typography>}
					{info.vmax && <Typography variant="subtitle2"><b>Höchstgeschwindigkeit: </b>{info.vmax} km/h</Typography>}
					{info.reason && <Typography variant="subtitle2"><b>Grund: </b>{info.reason}</Typography>}
					{info.length && <Typography variant="subtitle2"><b>Staulänge: </b>{info.length} km</Typography>}
					{info.duration && info.duration !== 0 && <Typography variant="subtitle2"><b>Dauer: </b>{info.duration} min.</Typography>}
					{info.delay && <Typography variant="subtitle2"><b>Verzögerung: </b>{info.delay} min.</Typography>}
					{info.createDate && <Typography variant="subtitle2"><b>gemeldet: </b>{info.createDate}</Typography>}
					{info.confirmDate && <Typography variant="subtitle2"><b>bestätigt: </b>{info.confirmDate}</Typography>}
				</CardContent>
			</Card>
		</Box>
	);
}

export default TrapInfo;
