import React, { useState } from 'react';
import { Backdrop, Button, CircularProgress, Grid } from '@material-ui/core';
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles';
import axios from 'axios';
import Form from './Form';
import DataGrid from './Grid';
import List from './List';
import { Calculator } from './Calculator'
import { ContentErrorContainer} from './ErrorContainer'
import ContentData, { Record } from './ContentData'
import { History } from 'history'
import { getHost } from './Environment';
import { Row, Layout, Image } from './Api'

type Props = {
	app: string,
	content: string,
	condition: Record,
	history: History
};

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
		padding: theme.spacing(1)
    },
	backdrop: {
		zIndex: theme.zIndex.drawer + 1,
		color: '#fff',
	},
  }),
);

const ContentBody: React.FC<Props> = React.memo(props => {
	const classes = useStyles();
	const [layout, setLayout] = useState<Layout>({
		Registerable: false,
		Rows: []
	});
	const [operationData, setOperationData] = useState(new ContentData());
	const [images, setImages] = useState<Image[]>([]);
	const [loaded, setLoaded] = useState(false);

	const updateImage = (block: string, row: number, column: string, url: string, type: string, image: string) => {
		let cloned = [...images];
		cloned.push({block, row, column, url, type, image});
		setImages(cloned);
	}

	const updateValue = (block: string, row: number, column: string, value: any, errorMessage?: string) => {
		updateValues(block, [{row, column, value, errorMessage}]);
	}

	const updateValues = (block: string, changes: {row: number, column: string, value: any, errorMessage?: string}[]) => {
		let cloned = operationData.clone();

		changes.forEach(change => {
			let clonedBlock = cloned.getBlock(block);

			if(clonedBlock) {
				clonedBlock.records[change.row][change.column] = change.value;
			}

			if(change.errorMessage) {
				cloned.clientErrors.add(block, change.row, change.column, change.errorMessage);
			} else {
				cloned.clientErrors.remove(block, change.row, change.column);
			}

			cloned.serverErrors.remove(block, change.row, change.column);
		});

		cloned.isCalculated = true;

		setOperationData(cloned);
	}

	const insertRecords = (block: string, rows: {index: number, record: Record, errors: {column: string, message: string}[]}[]) => {
		let cloned = operationData.clone();
		cloned.insert(block, rows);
		cloned.isCalculated = true;
		setOperationData(cloned);
	}

	const removeRecord = (block: string, rows: number[]) => {
		let cloned = operationData.clone();
		cloned.delete(block, rows);
		cloned.isCalculated = true;
		setOperationData(cloned);
	}

	const mapData = (apiResult: any) => {
		return apiResult.map((block: {id: string, data: any}) => {
			return {
				id: block.id,
				records: block.data
			};
		});
	}

	const mapServerErrors = (apiResult: any) => {
		let serverErrors = new ContentErrorContainer();
		for (const key in apiResult) {
			apiResult[key].forEach((error: any) => {
				serverErrors.add(key, error.RowIndex, error.ColumnID, error.Message);
			});
		}
		return serverErrors;
	}

	const save = () => {
		getHost(props.app).then(host => {
			axios.post(`https://${host}/${props.content}/save`, {
				condition: JSON.stringify(props.condition),
				data: JSON.stringify(operationData?.blocks.map(block => {
					return {
						gridId: block.id,
						data: block.records
					}
				})),
				images: JSON.stringify(images)
			}).then(result => {
				console.log(JSON.stringify(result.data));
			});
		});
	}

	React.useEffect(() => {
		if(!props.app) return;
		if(!props.content) return;

		getHost(props.app).then(host => {
			(async() => {
				let layoutJson = await axios.post(`https://${host}/${props.content}/layout`, {
					condition: JSON.stringify(props.condition)
				});

				setLayout({
					Registerable: layoutJson.data.Registerable,
					Rows: layoutJson.data.Rows
				});
			})();

			(async() => {
				let dataApiResult = await axios.post(`https://${host}/${props.content}/data`, {
					condition: JSON.stringify(props.condition)
				});

				let data = mapData(dataApiResult.data.RecalculatedData);
				let serverErrors = mapServerErrors(dataApiResult.data.ValidationResults);

				setOperationData(new ContentData(data, serverErrors));

				setLoaded(true);
			})();
		});
	}, [props.app, props.content, props.condition]);

	React.useEffect(() => {
		if(layout.Rows.length === 0) return;
		if(operationData.blocks.length === 0) return;

		setOperationData(operationData);
	}, [layout, operationData]);

	React.useEffect(() => {
		if(operationData.clientErrors.exists() || !operationData.isCalculated){
			Calculator.cancel();
			return;
		}

		if(!operationData.blocks.length) return;

		let data = {
			condition: JSON.stringify(props.condition),
			data: JSON.stringify(operationData.blocks.map(block => {
				return {
					gridId: block.id,
					data: block.records
				}
			}))
		};

		Calculator.do(props.app, props.content, "", data, (RecalculatedData: any, ValidationResults: any) => {
			if (RecalculatedData) {
				let serverErrors = mapServerErrors(ValidationResults);
				let operationData = new ContentData(mapData(RecalculatedData), serverErrors);
				setOperationData(operationData);
			}
		});
	}, [props.app, props.content, props.condition, operationData]);

	const createLayoutSub = (rows: Row[], size: number) => {
		return (
			// <Grid className={classes.root} container spacing={0} justify="center">
			<Grid className={classes.root} container spacing={0} justify="center">
			<Grid container item spacing={2} justify="center">
				{rows.map((row: Row, rowIndex: number) => {
					return (
						<Grid container item key={rowIndex} spacing={2} xs={12} justify="center">
							{row.Columns.map((col, colIndex) => {
								if (col.Rows.length === 0) {
									return (
										//<Grid item xs={12} lg={6} key={colIndex}>
										<Grid item xs={12} md={col.size} key={colIndex}>
											{col.Contents.map((content, contentIndex) => {
												let block = operationData.getBlock(content.Id);

												if(!block) return;

												switch(content.BlockType){
													case "form":
														return <Form
															app={props.app}
															content={props.content}
															block={content.Id}
															name={content.Name}
															noFrame={content.NoFrame}
															explain={content.Explain}
															key={contentIndex}
															updateValue={updateValue}
															updateImage={updateImage}
															data={operationData.getRecord(content.Id, 0)}
															clientError={operationData.clientErrors.getBlockErrors(content.Id)}
															serverError={operationData.serverErrors.getBlockErrors(content.Id)}
															condition={props.condition}
															history={props.history}
														/>
													case "grid":
														return <DataGrid
															app={props.app}
															content={props.content}
															block={content.Id}
															key={contentIndex}
															updateValues={updateValues}
															data={block.records}
															serverError={operationData.serverErrors.getBlockErrors(content.Id)}
															clientError={operationData.clientErrors.getBlockErrors(content.Id)}
															insertRecords={insertRecords}
															condition={props.condition}
															removeRecord={removeRecord}
														/>
													case "list":
														return <List
															app={props.app}
															content={props.content}
															key={contentIndex}
															block={content.Id}
															name={content.Name}
															condition={props.condition}
															data={block.records}
															history={props.history}
															type='list'
														/>
													case "card":
														return <List
															app={props.app}
															content={props.content}
															key={contentIndex}
															block={content.Id}
															name={content.Name}
															condition={props.condition}
															data={block.records}
															history={props.history}
															type='card'
														/>
													default:
														throw new Error();
												}
											})}
										</Grid>
									);
								} else {
									return (
										<div className="col" key={colIndex}>
											{createLayoutSub(col.Rows, row.size)}
										</div>
									);
								}
							})}
						</Grid>
					);
				})}
			</Grid>
			</Grid>
		);
	}

	return (
        <div>
			{createLayoutSub(layout.Rows, 12)}
			{layout.Registerable ? <Button variant="contained" onClick={save}>Register</Button> : null}
			<Backdrop className={classes.backdrop} open={!loaded}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</div>
	);
});

export default ContentBody;
