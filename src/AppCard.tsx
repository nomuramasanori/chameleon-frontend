import React from 'react';
import {History} from 'history'
import axios from 'axios';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Typography from '@material-ui/core/Typography';
import { getHost } from './Environment';

type Props = {
	app: string,
	history: History
};

interface State {
	name: string,
	description: string,
	image: string
}

class AppCard extends React.Component<Props, State>{
	constructor(props: any){
		super(props);
		this.state = {
			name: "",
			description: "",
			image: ""
		}
	}

	render(){
		return (
			<Card onClick={this.transit} style={{width: 400}}>
				<CardActionArea>
				<CardMedia
					component="img"
					alt=""
					height="300"
					image={this.state.image}
					title=""
				/>
				<CardContent>
					<Typography gutterBottom variant="h5" component="h2">{this.state.name}</Typography>
					<Typography variant="body2" color="textSecondary" component="p">{this.state.description}</Typography>
				</CardContent>
				</CardActionArea>
			</Card>
		);
	}

	componentDidMount(){
		getHost(this.props.app).then(host => {
			axios
			// .get(`https://${host}/Application/Api/ApplicationInfomation`)
			.get(`https://${host}/application`)
			.then(results => {
				this.setState({
					name: results.data.Name,
					description: results.data.Description
				});
			})
			.catch(() => {
			  console.log('通信に失敗しました。');
			});

			axios
			// .get(`https://${host}/Application/Api/Image`)
			.get(`https://${host}/image`)
			.then(results => {
				this.setState({
					image: "data:image/png;base64," + results.data
				});
			})
			.catch(() => {
			  console.log('通信に失敗しました。');
			});
		});
	}

	transit = () => {
		this.props.history.push(`/${this.props.app}`);
	}
}

export default AppCard;