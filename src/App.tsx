import React from 'react';
import {
	BrowserRouter as Router,
	Switch,
	Route,
	Link,
} from 'react-router-dom'
import AppMenu from './AppMenu'
import Content from './Content'
import { AppBar, CssBaseline, Toolbar, Typography } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core';
import axios from 'axios';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			flexGrow: 1,
		},
		div: {
			marginTop: "100px",
		},
		title: {
			flexGrow: 1,
		},
		webButton: {
			textTransform: 'none',
		},
		link: {
			textDecoration: 'none',
			color: 'inherit'
		}
	}),
);

const App = () => {
	const classes = useStyles();

	axios.interceptors.request.use(
		// allowedOriginと通信するときにトークンを付与するようにする設定
		config => {
			const { origin } = new URL(config.url as string);
			const allowedOrigins = ['https://localhost:44359', 'https://localhost:44370'];
			const token = localStorage.getItem('jwt');
			if (allowedOrigins.includes(origin)) {
				config.headers.authorization = `Bearer ${token}`;
			}
			return config;
		},
		error => {
			return Promise.reject(error);
		}
	);

	return (
		<div className={classes.root}>
			<CssBaseline />
			{/* <AppBar elevation={0} position="static"> */}
			<Router>
				<AppBar elevation={0}>
					<Toolbar>
						<Typography variant="h6" className={classes.title}>
							Matcho
						</Typography>
						{/* <Button color="inherit" className={classes.webButton} onClick={transit}>Sign In</Button> */}
						<Link to="/Identification/Identification.SignIn" className={classes.link}>Sign In</Link>
					</Toolbar>
				</AppBar>
				<div className={classes.div}/>
				<Switch>
					<Route exact path="/" component={AppMenu}/>
					<Route exact path="/:app" component={Content}/>
					<Route exact path="/:app/:content" component={Content}/>
				</Switch>
			</Router>
		</div>
	)
}

export default App
