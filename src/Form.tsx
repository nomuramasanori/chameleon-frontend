import React, { useRef, useState }  from 'react';
import axios from 'axios';
import NumberInput from './NumberInput'
import TextInput from './TextInput'
import ListInput from './ListInput'
import {BlockErrorContainer} from './ErrorContainer'
import { Button, Card, CardHeader, Grid } from '@material-ui/core';
import { makeStyles, Theme, createStyles } from '@material-ui/core/styles';
import { Record } from './ContentData'
import { History } from 'history'
import { ColumnProperty } from './Api'
import { getHost } from './Environment';
import Image from './Image';
import MultipleCheckbox from './MultipleCheckbox';
import Checkbox from './Checkbox';
import HyperLink from './HyperLink';

type Props = {
	app: string,
	content: string,
	block: string,
	name: string,
	noFrame: boolean,
	explain: string,
	data?: any,
	updateValue: (block: string, row: number, column: string, value: any, errorMessage?: string) => void,
	updateImage: (block: string, row: number, column: string, url: string, type: string, image: string) => void,
	serverError?: BlockErrorContainer,
	clientError?: BlockErrorContainer,
	// addConvertor: (block: string, convert: (data: Array<{}>) => Array<{}>, restore: (data: Array<{}>) => Array<{}>) => void,
	condition: Record,
	history: History
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    paper: {
      padding: theme.spacing(2),
      backgroundColor: theme.palette.background.paper,
	},
	noFrame: {
		padding: theme.spacing(2),
		backgroundColor: 'transparent',
	},
	cardHeader: {
		marginTop: theme.spacing(-2),
		marginLeft: theme.spacing(-2),
		marginRight: theme.spacing(-2)
	  },
  }),
);

const Form: React.FC<Props> = props => {
	const classes = useStyles();
	const [blockProperty, setBlockProperty] = useState<ColumnProperty[]>();
	const [transitable, setTransitable] = useState<{id: string, name: string}[]>([]);
	const [authentication, setAuthentication] = useState('');
	const formRef = useRef<HTMLDivElement>(null);
	const [size, setSize] = useState<1|2|3|4|5|6|7|8|9|10|11|12>(12);
	// const addConvertor = React.useCallback(props.addConvertor, []);
	const [link, SetLink] = useState({
		destination: null,
		condition: null
	});

	const adjustSize = () => {
		if(!formRef.current) return;
		let width = formRef.current.clientWidth;

		switch (true) {
			case width > 1680: setSize(2); break;
			case width > 1024: setSize(3); break;
			case width > 896: setSize(4); break;
			case width > 480: setSize(6); break;
			default: setSize(12); break;
		}
	}

	React.useEffect(() => {
		// Fire manually for first rendering.
		adjustSize();

		window.addEventListener('resize', adjustSize);
		return () => window.removeEventListener('resize', adjustSize);
	}, []);

	React.useEffect(() => {
		(async() => {
			let host = await getHost(props.app);

			let result = (await axios.post(`https://${host}/${props.content}/${props.block}/columns`, {
				condition: JSON.stringify(props.condition)
			})).data;

			setBlockProperty(result);

			let transitable = (await axios.post(`https://${host}/${props.content}/${props.block}/linkable`, {
				condition: JSON.stringify(props.condition)
			})).data;

			setTransitable(transitable);

			let authentication = (await axios.post(`https://${host}/${props.content}/${props.block}/authentication`, {
				condition: JSON.stringify(props.condition)
			})).data;

			setAuthentication(authentication);
		})();

		// addConvertor(props.block, data => {return data}, data => {return data});
	// }, [props.app, props.content, props.block, props.condition, addConvertor]);
	}, [props.app, props.content, props.block, props.condition]);

	const updateValue = (column: string, value: any, errorMessage?: string) => {
		props.updateValue(props.block, 0, column, value, errorMessage);
	}

	const move = (id: string) => {
		(async() => {
			let host = await getHost(props.app);
			let result = (await axios.post(`https://${host}/${props.content}/${props.block}/link`, {
				id: id,
				condition: JSON.stringify(props.condition),
				rowData: JSON.stringify(props.data)
			})).data;

			SetLink(result);
		})();
	}

	const signin = () => {
		(async() => {
			let result = (await axios.post(authentication, {
				rawData: JSON.stringify(props.data)
			})).data;

			window.localStorage.setItem('jwt', result);
		})();
	}

	const dojwt = () => {
		(async() => {
			let result = (await axios.get('https://localhost:44370/hoge')).data;
		})();
	}

	React.useEffect(() => {
		if(!link.destination) return;

		props.history.push(`/${props.app}/${link.destination}`, link.condition);
	}, [props.app, props.history, link]);

	return (
		// <Paper className={classes.paper} elevation={2} ref={formRef} >
		<Card className={props.noFrame ? classes.noFrame : classes.paper} elevation={props.noFrame ? 0 : 2} ref={formRef} >
			<CardHeader
				className={classes.cardHeader}
				title={props.name}
				subheader={props.explain}
			/>
			<Grid container spacing={1}>
				{blockProperty?.map((column, columnIndex) => {
					return (
						// <Grid item key={columnIndex} xs={12} sm={6} md={3} lg={2}>
						// <Grid item key={columnIndex} xs={size}>
						<Grid item key={columnIndex} xs={12} sm={column.width}>
							{(() => {
								switch (column.type) {
									case "Number":
										return <NumberInput
											column={column.id}
											max={column.numberOption.max}
											min={column.numberOption.min}
											name={column.name}
											clientError={props.clientError?.getError(0, column.id)?.message}
											serverError={props.serverError?.getError(0, column.id)?.message}
											key={columnIndex}
											updateValue={updateValue}
											value={props.data ? props.data[column.id] : null}
											readOnly={column.readOnly}
										/>
									case "List":
										return <ListInput
											column={column.id}
											name={column.name}
											key={columnIndex}
											isRequired={column.required}
											clientError={props.clientError?.getError(0, column.id)?.message}
											serverError={props.serverError?.getError(0, column.id)?.message}
											updateValue={updateValue}
											value={props.data ? props.data[column.id] : null}
											getOptions={() => {
												return getHost(props.app).then(host => {
													return axios.post(`https://${host}/${props.content}/${props.block}/${column.id}/listItem`, {
														condition: JSON.stringify(props.condition),
														rowData: JSON.stringify(props.data)
													})
												}).then((result: any) => {
													return result.data;
												});;
											}}
										/>
									case "Text":
										return <TextInput
											column={column.id}
											name={column.name}
											maxLength={column.textOption.maxLength}
											minLength={column.textOption.minLength}
											isRequired={column.required}
											clientError={props.clientError?.getError(0, column.id)?.message}
											serverError={props.serverError?.getError(0, column.id)?.message}
											key={columnIndex}
											updateValue={updateValue}
											value={props.data ? props.data[column.id] : null}
											readOnly={column.readOnly}
										/>
									case "Image":
										return <Image
											column={column.id}
											app={props.app}
											content={props.content}
											block={props.block}
											updateImage={props.updateImage}
											pictureUrl={props.data ? props.data[column.id] : null}
										/>
									case "MultipleSelect":
										return <MultipleCheckbox
											column={column.id}
											name={column.name}
											key={columnIndex}
											clientError={props.clientError?.getError(0, column.id)?.message}
											serverError={props.serverError?.getError(0, column.id)?.message}
											updateValue={updateValue}
											options={column.listItems}
											grouping={column.multipleSelectOption.grouping}
											value={props.data ? props.data[column.id] : null}
										/>
									case "Checkbox":
										return <Checkbox
											column={column.id}
											name={column.name}
											key={columnIndex}
											clientError={props.clientError?.getError(0, column.id)?.message}
											serverError={props.serverError?.getError(0, column.id)?.message}
											updateValue={updateValue}
											value={props.data ? props.data[column.id] : null}
										/>
									case "HyperLink":
										return <HyperLink
											name={column.name}
											key={columnIndex}
											value={props.data ? props.data[column.id] : null}
											iconName={column.hyperLinkOption.iconName}
										/>
								}
							})()}
						</Grid>
					);
				})}
				{/* {transitable && (
					<Grid item xs={12}>
						<Button variant="contained" fullWidth={true} disableElevation onClick={move} size="large">Next</Button>
					</Grid>
				)} */}
				{transitable.map(linker =>
					<Grid item xs={12} lg={12}>
						<Button variant="contained" fullWidth={true} disableElevation={props.noFrame ? false : true} onClick={() => { move(linker.id) }} size="large">{linker.name}</Button>
					</Grid>
				)}
				{authentication ?
					<Grid item xs={12} lg={12}>
						<Button variant="contained" fullWidth={true} disableElevation={props.noFrame ? false : true} onClick={signin} size="large">sign-in</Button>
					</Grid> :
					null
				}
				{/* <Grid item xs={12} lg={12}>
					<Button variant="contained" fullWidth={true} disableElevation={props.noFrame ? false : true} onClick={dojwt} size="large">jwt</Button>
				</Grid> */}
			</Grid>
		{/* </Paper> */}
		</Card>
	);
}

export default Form;