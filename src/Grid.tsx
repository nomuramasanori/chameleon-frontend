import React from 'react';
import axios from 'axios';
import { HotTable } from '@handsontable/react';
import 'handsontable/dist/handsontable.full.css';
import {Calculator} from './Calculator'
import {BlockErrorContainer} from './ErrorContainer'
import {validateNumber, validateText, ValidationResult} from './Validation'
import { Grid, Card, CardHeader, IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import RemoveIcon from '@material-ui/icons/Remove';
import { Record } from './ContentData'
import { ColumnProperty } from './Api'
import { getHost } from './Environment';

type Props = {
	app: string,
	content: string,
	block: string,
	data: any[],
	updateValues: (block: string, changes: {row: number, column: string, value: any, errorMessage?: string}[]) => void,
	serverError?: BlockErrorContainer,
	clientError?: BlockErrorContainer,
	insertRecords: (block: string, rows: {index: number, record: Record, errors: {column: string, message: string}[]}[]) => void,
	removeRecord: (block: string, rows: number[]) => void,
	condition: Record,
}

type State = {
	data: any[],
	colHeaders: string[],
	columns: { [key: string]: any; }[],
	colWidths: number[],
}

class DataGrid extends React.Component<Props, State> {
	clientErrors: BlockErrorContainer;
	serverErrors: BlockErrorContainer;
	selected?: {
		row: number,
		column: number,
		row2: number,
		column2: number,
		rowCount: number;
		columnCount: number;
	};

	fields: ColumnProperty[]

	hotTableComponent: React.RefObject<HotTable>;

	constructor(props: Props) {
		super(props);

		this.state = {
			data: [],
			colHeaders: [],
			columns: [],
			colWidths: []
		};

		this.clientErrors = new BlockErrorContainer();
		this.serverErrors = new BlockErrorContainer();
		this.fields = [];
		this.hotTableComponent = React.createRef<HotTable>();
		this.selected = undefined;
	}

	convertData = (data: Array<{}>) => {
		let cloned = data.map( data => ({...data}));

		cloned.forEach((row: any) => {
			this.fields.forEach(column => {
				if(column.type !== 'List') return;
				if(!column.listItems) return;
				let finded = column.listItems.find((item: any) => item.Id === row[column.id]);
				row[column.id] = finded?.Name??row[column.id];
			});
		});

		return cloned;
	}

	convertToRawValue = (field: ColumnProperty, displayValue: any) => {
		if(field.type === 'List'){
			if(displayValue.includes(':')){
				// コード:名称となっていればコードが実値
				return displayValue.split(':')[0];
			} else {
				// 表示が名称のみであればコードを検索します
				return field.listItems.find(listItem => listItem.Name === displayValue)?.Id;
			}
		} else {
			// Listでなければ表示値が実値
			return displayValue;
		}
	}

	getHandsontable = () => {
		if(!this.hotTableComponent.current) throw new Error();
		return this.hotTableComponent.current.hotInstance;
	}

	componentDidMount(){
		(async() => {
			let host = await getHost(this.props.app);

			let gridOption = (await axios.post(`https://${host}/${this.props.content}/${this.props.block}/grid`, {
				condition: JSON.stringify(this.props.condition)
			})).data;

			console.log(gridOption);

			this.fields = (await axios.post(`https://${host}/${this.props.content}/${this.props.block}/columns`, {
				condition: JSON.stringify(this.props.condition)
			})).data;

			//カラムを作成します
			var colHeaders: string[] = [];
			var columns: { [key: string]: any; }[] = [];
			let colWidths: number[] = [];

			for (var c = 0; c < this.fields.length; c++) {
				var column: ColumnProperty = this.fields[c];

				let className = "";
				let colHeader = column.name;
				let colWidth = 100;
				let locked = column.readOnly;
				let numericFormat = {pattern: '0,0'};
				let type: string = "";
				let source;
				let strict = false;
				let allowInvalid = true;
				let validator: ((value: any, callback: (isValid:boolean) => void) => void) | undefined = undefined;

				switch (column.type) {
					case "Image":
						type = "text";
						break;
					case "MultipleSelect":
						type = "text";
						break;
					case "Text":
						type = "text";
						validator = (value: any, callback: (isValid:boolean) => void) => {callback(true)};
						break;
					case "Number":
						type = "numeric";
						numericFormat.pattern = "0,0.00";
						if (column.numberOption.displayDigit !== 0) {
							numericFormat.pattern += "."

							for (let i = 0; i < column.numberOption.displayDigit; i++) {
								numericFormat.pattern += "0";
							}
						}
						break;
					case "Boolean":
						type = "checkbox";
						break;
					case "List":
						type = "dropdown";

						let targetColumn = column.id;

						source = (query: any, process: any) => {
							if(!this.hotTableComponent.current) throw new Error();
							let ht = this.hotTableComponent.current.hotInstance;

							let row = (ht.getActiveEditor() as any).cellProperties["row"];

							var rowData: { [key: string]: any; } = {};

							ht.getDataAtRow(row).forEach((cell, k) => {
								// rowData[this.fields[k].id] = typeof cell == "string" ? cell.split(':')[0] : cell;
								// rowData[this.fields[k].id] = typeof cell == "string" && cell.includes(':') ? cell.split(':')[0] : cell;

								// if(this.fields[k].type === 'List'){
								// 	if(cell.includes(':')){
								// 		rowData[this.fields[k].id] = cell.split(':')[0];
								// 	} else {
								// 		rowData[this.fields[k].id] = this.fields[k].listItems.find(listItem => listItem.Name === cell)?.Id;
								// 	}
								// } else {
								// 	rowData[this.fields[k].id] = cell;
								// }
								rowData[this.fields[k].id] = this.convertToRawValue(this.fields[k], cell)
							});

							axios.post(`https://${host}/${this.props.content}/${this.props.block}/${targetColumn}/listItem`, {
								condition: JSON.stringify(this.props.condition),
								rowData: JSON.stringify(rowData)
							}).then((response: any) => {
								var items: Array<any> = [];
								response.data.forEach((item: any) => {
									items.push(item.Name);
								});
								process(items);
							});
						};

						allowInvalid = false;
						break;
				}

				colHeaders.push(colHeader);
				colWidths.push(colWidth);
				columns.push({
					readOnly: locked,
					type: type,
					data: column.id,
					source: source,
					strict: strict,
					allowInvalid: allowInvalid,
					className: className,
					numericFormat: numericFormat,
					validator: validator
				});
			}

			this.setState({
				data: this.convertData(this.props.data),
				colHeaders: colHeaders,
				columns: columns,
				colWidths: colWidths
			});

			window.addEventListener('resize', this.getHandsontable().render);
		})();
	}

	componentDidUpdate(prevProps: Props, prevState: State, snapshot: any) {
		if(this.props.data !== prevProps.data) {
			this.setState({
				data: this.convertData(this.props.data),
				colHeaders: prevState.colHeaders,
				columns: prevState.columns,
				colWidths: prevState.colWidths
			});
		}
	}

	componentWillUnmount(){
		window.removeEventListener('resize', this.getHandsontable().render);
	}

	createBlankRecord = () => {
		let blankRecord: any = {};
		let errors: {column: string, message: string}[] = [];
		this.fields.forEach(prop => {
			let initialValue;
			let validationResult;
			switch (prop.type) {
				case "Image":
				case "MultipleSelect":
					break;
				case "Number":
					initialValue = 0;
					validationResult = validateNumber(
						initialValue,
						prop.numberOption.max,
						prop.numberOption.min);
					break;
				case "Text":
					initialValue = "";
					validationResult = validateText(
						initialValue,
						prop.required,
						prop.textOption.maxLength,
						prop.textOption.minLength);
					break;
				case "List":
					initialValue = "";
					validationResult = validateText(
						initialValue,
						prop.required);
					break;
				case "Boolean":
					break;
				default:
					throw new Error();
			}

			blankRecord[prop.id] = initialValue;
			if(validationResult?.message) errors.push({
				column: prop.id,
				message: validationResult.message
			});
		});

		return {
			record: blankRecord,
			errors
		};
	}

	addRow = () => {
		if(!this.selected) return;
		let selectedRow = this.selected.row;
		let rowCount = this.selected.rowCount;
		let rows = [...Array(rowCount)].map((_, i) => {
			let blankRecord = this.createBlankRecord();
			return {
				index: i + selectedRow,
				record: blankRecord.record,
				errors:blankRecord.errors
			};
		});
		this.props.insertRecords(this.props.block, rows);

		//focused at added row
		this.getHandsontable().selectCell(selectedRow, 0);
	}

	removeRow = () => {
		if(!this.selected) return;
		let selected = this.selected.row;
		let rowCount = this.selected.rowCount;
		let rows = [...Array(rowCount)].map((_, i) => i + selected);
		this.props.removeRecord(this.props.block, rows);

		//focused at where the removed row was
		if (this.getHandsontable().countRows() - 1 < selected) selected -= 1;
		this.getHandsontable().selectCell(selected, 0);
	}

	beforeChange = (changes: [number, string | number, any, any][], source: string) => {
		let arrangedChanges: any[] = [];

		changes.forEach(change => {
			let row = change[0];

			if(typeof change[1] === "number") throw new Error();

			let value;
			let property = this.fields.find(property => property.id === change[1]);
			if(!property) throw new Error();

			// if(property.type === 'List'){
			// 	if(!change[3]) return;
			// 	if(change[3].includes(':')){
			// 		let splitted = change[3].split(':');
			// 		value = splitted[0];
			// 	} else{
			// 		// 名称のみの場合はコードを取得し値とします
			// 		// value = change[3];
			// 		value = property.listItems.find(listItem => listItem.Name === change[3])?.Id
			// 	}
			// } else {
			// 	value = change[3];
			// }
			value = this.convertToRawValue(property, change[3])

			arrangedChanges.push({
				row: row,
				column: change[1],
				value: value,
				errorMessage: this.clientErrors.getError(row, change[1])?.message
			});
		});

		this.props.updateValues(this.props.block, arrangedChanges);
	}

	afterValidate = (isValid: boolean, value: any, row: number, prop: string | number, source: any) => {
		if(typeof prop === "number") throw new Error();
		let col = this.getHandsontable().propToCol(prop);

		let validationResult: ValidationResult;
		let columnProperty = this.fields[col];

		switch (columnProperty.type) {
			case "Number":
				validationResult = validateNumber(
					value,
					columnProperty.numberOption.max,
					columnProperty.numberOption.min);
				break;
			case "Text":
				validationResult = validateText(
					value,
					columnProperty.required,
					columnProperty.textOption.maxLength,
					columnProperty.textOption.minLength);
				break;
			case "List":
				validationResult = validateText(
					value,
					columnProperty.required);
				break;
			default:
				throw new Error();
		}

		if (!validationResult.isValid) {
			this.clientErrors.add(row, prop, validationResult.message);
		} else {
			this.clientErrors.remove(row, prop);
		}
	}

	afterRender = (isForced: boolean) => {
		if(!this.hotTableComponent.current) return;
		let ht = this.hotTableComponent.current.hotInstance;

		for (let r = 0; r < ht.countRows(); r++) {
			for (let c = 0; c < this.fields.length; c++) {
				const TD = ht.getCell(r, c);
				TD?.removeAttribute('title');
			}
		}

		this.clientErrors.getErrors().forEach(cell => {
			const TD = ht.getCell(cell.row, ht.propToCol(cell.column));
			TD?.classList.add('htInvalid');
			TD?.setAttribute('title', cell.message);
		});

		this.serverErrors.getErrors().forEach(cell => {
			const TD = ht.getCell(cell.row, ht.propToCol(cell.column));
			TD?.setAttribute('style', 'background-color: #ff9800');
			TD?.setAttribute('title', cell.message);
		});
	}

	afterLoadData = (firstTime: boolean) => {
		// console.log("afterLoadData");
	}
	afterChange = ( changes: any[], source: string) => {
		// console.log("change");
	}
	afterInit = () => {
		// console.log("afterInit");
	}
	afterListen = () => {
		// console.log("afterListen");
		if(!this.selected) return;
	}
	afterBeginEditing = () => {
		// console.log("afterBeginEditing");
		Calculator.cancel();
	}
	afterDeselect = () => {
		// console.log("afterDeselect");
	}
	afterUnlisten = () => {
		// console.log("afterUnlisten");
	}
	afterSelectionEnd = (row: number, column: number, row2: number, column2: number) => {
		Calculator.delay();
		this.selected = {
			row,
			column,
			row2,
			column2,
			rowCount: Math.abs(row2 - row) + 1,
			columnCount: Math.abs(column2 - column) + 1
		};
	}
	beforeKeyDown = (e: any) => {
		if (e.keyCode === 27) {
			Calculator.resume();
			return;
		}
	}

	render() {
		if(this.props.serverError){
			this.serverErrors = this.props.serverError;
		}

		if(this.props.clientError){
			this.clientErrors = this.props.clientError;
		}

		return (
			<Card elevation={2}>
				<CardHeader
					title="Shrimp and Chorizo Paella"
					action={
						<div>
							<IconButton aria-label="settings" onClick={this.addRow}>
								<AddIcon />
							</IconButton>
							<IconButton aria-label="settings" onClick={this.removeRow}>
								<RemoveIcon />
							</IconButton>
						</div>
					}
				/>
				<Grid item xs={12}>
				<div id="hot-app">
					<HotTable ref={this.hotTableComponent} settings={{
						data: this.state.data,
						columns: this.state.columns,
						colHeaders: this.state.colHeaders,
						rowHeaders: true,
						colWidths: this.state.colWidths,
						autoColumnSize: false,
						autoRowSize: false,
						autoWrapRow: false,
						autoWrapCol: false,
						manualColumnResize: true,
						manualRowResize: true,
						height: 300,
						afterLoadData: this.afterLoadData,
						beforeChange: this.beforeChange,
						afterChange: this.afterChange,
						afterBeginEditing: this.afterBeginEditing,
						afterValidate: this.afterValidate,
						afterRender: this.afterRender,
						afterInit: this.afterInit,
						afterListen: this.afterListen,
						afterDeselect: this.afterDeselect,
						afterUnlisten: this.afterUnlisten,
						afterSelectionEnd: this.afterSelectionEnd,
						beforeKeyDown : this.beforeKeyDown
					}} />
				</div>
				</Grid>
			</Card>
		);
	}
}

export default DataGrid;
