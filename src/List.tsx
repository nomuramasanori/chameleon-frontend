import React, { useState } from 'react';
import { createStyles, Theme, makeStyles } from '@material-ui/core/styles';
import MuiList from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import Typography from '@material-ui/core/Typography';
import axios from 'axios';
import { getHost } from './Environment';
import { Record } from './ContentData'
import { ColumnProperty } from './Api'
import { Card, CardHeader, Grid } from '@material-ui/core';
import { History } from 'history'
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
    //   maxWidth: '36ch',
      backgroundColor: theme.palette.background.paper,
    },
    inline: {
      display: 'inline',
    },
	large: {
		width: theme.spacing(7),
		height: theme.spacing(7),
	},
	grid: {
		padding: theme.spacing(2),
	},
  }),
);

type Props = {
	app: string,
	content: string,
	block: string,
	name: string,
	condition: Record,
	data: any[],
	history: History,
	type: 'list' | 'card'
};

const List: React.FC<Props> = props => {
	const classes = useStyles();
	const [fields, setFields] = useState<ColumnProperty[]>([]);
	const [linkable, setLinkable] = useState<{id: string, name: string}[]>([]);
	const [link, SetLink] = useState({
		destination: null,
		condition: null
	});

	React.useEffect(() => {
		(async() => {
			let host = await getHost(props.app);

			let fields = (await axios.post(`https://${host}/${props.content}/${props.block}/columns`, {
				condition: JSON.stringify(props.condition)
			})).data;

			setFields(fields);

			let linkable = (await axios.post(`https://${host}/${props.content}/${props.block}/linkable`, {
				condition: JSON.stringify(props.condition)
			})).data;

			setLinkable(linkable);
		})();
	}, [props.app, props.content, props.block, props.condition]);

	const move = (record: any) => {
		if(!linkable) return;

		(async() => {
			let host = await getHost(props.app);

			let result = (await axios.post(`https://${host}/${props.content}/${props.block}/link`, {
				id: linkable[0].id,
				condition: JSON.stringify(props.condition),
				rowData: JSON.stringify(record)
			})).data;

			SetLink(result);
		})();
	}

	React.useEffect(() => {
		if(!link.destination) return;

		props.history.push(`/${props.app}/${link.destination}`, link.condition);
	}, [props.app, props.history, link]);

	const format = (value: any, field: ColumnProperty) => {
		if(field.type !== 'List') return value;

		let findedAllListItem = fields.find(f => f.id === field.id)?.listItems;

		return findedAllListItem?.find(listItem => listItem.Id === value)?.Name;
	}

	return (
		props.type === 'list' ? (
			<Card elevation={2}>
				<CardHeader
					title={props.name}
				/>
				<Grid container spacing={1}>
					<MuiList className={classes.root}>
						{props.data.map((record, index) => {
							let imageColumn = fields.find(column => column.listItemType === 'Image')
							let titleColumn = fields.find(column => column.listItemType === 'Title')
							let body1Column = fields.find(column => column.listItemType === 'Body1')
							let body2Column = fields.find(column => column.listItemType === 'Body2')
							let image = imageColumn ? record[imageColumn.id] : '';
							let title = titleColumn ? format(record[titleColumn.id], titleColumn) : '';
							let body1 = body1Column ? format(record[body1Column.id], body1Column) : '';
							let body2 = body2Column ? format(record[body2Column.id], body2Column) : '';

							return (
								<div key={index}>
									<ListItem button={true} alignItems="flex-start" onClick={() => move(record)}>
										<ListItemAvatar>
											<Avatar alt="Remy Sharp" src={image} />
										</ListItemAvatar>
										<ListItemText
											primary={title}
											secondary={
												<React.Fragment>
												<Typography
													component="span"
													variant="body2"
													className={classes.inline}
													color="textPrimary"
												>
													{body1}
												</Typography>
												<br />{body2}
												</React.Fragment>
											}
										/>
									</ListItem>
									{index + 1 === props.data.length ? null : <Divider variant="inset" component="li" />}
								</div>
							);
						})}
					</MuiList>
				</Grid>
			</Card>
		) : (
			<Grid container spacing={2} justify="center" className={classes.grid}>
					{props.data.map((record, index) => {
						let imageColumn = fields.find(column => column.listItemType === 'Image')
						let titleColumn = fields.find(column => column.listItemType === 'Title')
						let body1Column = fields.find(column => column.listItemType === 'Body1')
						let image = imageColumn ? record[imageColumn.id] : '';
						let title = titleColumn ? format(record[titleColumn.id], titleColumn) : '';
						let body1 = body1Column ? format(record[body1Column.id], body1Column) : '';

						return (
							<Grid item key={index}>
							<Card onClick={() => move(record)} style={{width: 400}}>
								<CardActionArea>
								<CardMedia
									component="img"
									alt=""
									height="300"
									image={image}
									title=""
								/>
								<CardContent>
									<Typography gutterBottom variant="h5" component="h2">{title}</Typography>
									<Typography variant="body2" color="textSecondary" component="p">{body1}</Typography>
								</CardContent>
								</CardActionArea>
							</Card>
							</Grid>
						);
					})}
			</Grid>
		)
	);
}

export default List;