import React from 'react';
import {RouteComponentProps} from 'react-router-dom'
import axios from 'axios';
import ContentCard from './ContentCard'
import { getHost } from './Environment';
import { Grid } from '@material-ui/core';

type Props = {} & RouteComponentProps<{app: string}>;

interface State {
	contents: {
		id: string,
		name: string,
		description: string,
		showAsMenu: boolean,
	}[]
}

class ContentMenu extends React.Component<Props, State> {
	constructor(props: any){
		super(props);
		this.state = {
			contents: []
		}
	}

	render() {
		return (
		<React.Fragment>
			<div dangerouslySetInnerHTML={this.createMarkup()} />
			<div style={{padding: 10}}>
				<Grid container spacing={2} justify="center">
					{this.state.contents.map((content, index) => {
						if(!content.showAsMenu) return;

						return <Grid item>
							<ContentCard
								app={this.props.match.params.app}
								content={content.id}
								name={content.name}
								description={content.description}
								history={this.props.history}
								key={index}
							/>
						</Grid>;
					})}
				</Grid>
			</div>
		</React.Fragment>
		);
	}

	componentDidMount(){
		getHost(this.props.match.params.app).then(host => {
			axios
			.get(`https://${host}/contents`)
			.then(results => {
				this.setState({contents: results.data});
			})
			.catch(() => {
			  console.log('通信に失敗しました。');
			});
		});
	}

	createMarkup = () => {
		// return {__html: '<div class="ext">Hello!</div>'};
		return {__html: `<img src="https://localhost:44335/image/slide1-4.jpg">`};
	}
}

export default ContentMenu;
