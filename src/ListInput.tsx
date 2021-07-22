// *https://www.registers.service.gov.uk/registers/country/use-the-api*
import React from 'react';
import TextField from '@material-ui/core/TextField';
import Autocomplete from '@material-ui/lab/Autocomplete';
import CircularProgress from '@material-ui/core/CircularProgress';
import {validateText} from './Validation'
import { useStyle, useStyleWarning } from './InputStyle';

type Props = {
	column: string,
	name: string,
	value?: string,
	isRequired: boolean,
	clientError?: string,
	serverError?: string,
	updateValue: (column: string, value?: string, errorMessage?: string) => void,
	getOptions: () => Promise<Option[]>
}

interface Option {
	code: string,
	name: string
}

type SelectedOption = {
	option: Option | null
}

const ListFinder: React.FC<Props> = props => {
	const [open, setOpen] = React.useState(false);
	const [options, setOptions] = React.useState<Option[]>([]);
	const [selectedOption, setSelectedOption] = React.useState<SelectedOption>({option: null});
	const loading = open && options.length === 0;
	const classes = useStyle();
	const classesWarning = useStyleWarning();

	const onChange = React.useCallback((e: any, option: Option | null) => {
		let value = option === null ? "" : option.code;
		props.updateValue(props.column, value, validateText(value, props.isRequired).message);
	}, [props]);

	React.useEffect(() => {
		// https://qiita.com/daishi/items/2c40e27f7589231dbcef
		let cleanedUp = false;

		(async() => {
			let result = await props.getOptions();

			if(!result) return;

			let options = result.map((item: any) => {
				return {
					code: item.Id,
					name: item.Name
				}
			}) as Option[];

			if (!cleanedUp) {
				setOptions(options);

				if(!props.value){
					setSelectedOption({option: null});
					return;
				}

				if(options.length === 0) return;

				let findedOption = options.find(option => {
					return option.code === props.value;
				});

				if(findedOption){
					setSelectedOption({option: {code: findedOption.code, name: findedOption.name}});
				}
			}
		})();

		const cleanup = () => {
			cleanedUp = true;
		};
		return cleanup;
	}, [props, onChange]);

	return (
		<form className={props.clientError ? classes.root : classesWarning.root} noValidate autoComplete="off">
		<Autocomplete
			id={props.column}
			open={open}
			onOpen={() => {
				setOpen(true);
			}}
			onClose={() => {
				setOpen(false);
			}}
			value={selectedOption.option}
			onChange={onChange}
			getOptionSelected={(option, value) => option.code === value.code}
			getOptionLabel={(option) => option.name}
			options={options}
			loading={loading}
			fullWidth={true}
			renderInput={(params) => (
				<TextField
					{...params}
					error={Boolean(props.clientError) || Boolean(props.serverError)}
					helperText={props.clientError ? props.clientError : props.serverError}
					label={props.name}
					variant="outlined"
					InputProps={{
					...params.InputProps,
					endAdornment: (
						<React.Fragment>
						{loading ? <CircularProgress color="inherit" size={20} /> : null}
						{params.InputProps.endAdornment}
						</React.Fragment>
					),
					}}
				/>
			)}
		/>
		</ form>
	);
}

export default ListFinder;