import React, {useState} from 'react';
import { useStyle, useStyleWarning } from './InputStyle';
import TextField from '@material-ui/core/TextField';
import {validateNumber} from './Validation'

interface Props {
	column: string,
	max: number,
	min: number,
	name: string,
	clientError?: string,
	serverError?: string,
	value?: number,
	updateValue: (column: string, value: number, errorMessage?: string) => void,
	readOnly: boolean
}

const NumberInput: React.FC<Props> = props => {
	const [value, setValue] = useState<number>(0);
	const classes = useStyle();
	const classesWarning = useStyleWarning();

	React.useEffect(() => {
		setValue(props.value??0);
	}, [props.value, props.column]);

	const changeText = (e: any) => {
		setValue(e.target.value);
	}

	const updateText = (e: any) => {
		let value = Number(e.target.value);

		if(props.value === value) return;

		props.updateValue(props.column, value, validateNumber(value, props.max, props.min).message);
	}

	return (
		<form className={props.clientError ? classes.root : classesWarning.root} noValidate autoComplete="off">
			<TextField
				error={Boolean(props.clientError) || Boolean(props.serverError)}
				helperText={props.clientError ? props.clientError : props.serverError}
				label={props.name}
				variant="outlined"
				type="number"
				value={value}
				onChange={changeText}
				onBlur={updateText}
				fullWidth={true}
				InputProps={{
					readOnly: props.readOnly,
				}}
			/>
		</form>
	);
}

export default NumberInput;