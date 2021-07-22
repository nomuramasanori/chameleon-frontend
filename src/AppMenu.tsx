import React from 'react';
import {History} from 'history'
import axios from 'axios';
import AppCard from './AppCard'
import { Environment } from './Environment';
import { Grid } from '@material-ui/core';

type Props = {
	history: History
};

interface State {
	apps: string[]
}

class AppMenu extends React.Component<Props, State> {
	constructor(props: any){
		super(props);
		this.state = {
			apps: []
		}
	}

	render() {
		return (
		<Grid container spacing={2} justify="center">
			{this.state.apps.map((app, index) => {
				return <Grid item key={index}>
					<AppCard app={app} history={this.props.history}></AppCard>
				</Grid>;
			})}
		</Grid>
		);
	}

	componentDidMount(){
		axios
		.get(`${Environment.api.url}/api/applicationids`)
		.then(results => {
			// this.setState({apps: results.data});
			if(results.data.length === 1){
				this.props.history.replace(`/${results.data[0]}`);
			} else{
				this.setState({apps: results.data});
			}
		})
		.catch(() => {
		  console.log('通信に失敗しました。');
		});
	}
}

export default AppMenu;
