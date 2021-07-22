import React, { useState } from 'react';
import { useStyle, useStyleWarning } from './InputStyle';
import TextField from '@material-ui/core/TextField';
import {validateText} from './Validation'

interface Props {
	column: string,
	name: string,
	maxLength?: number,
	minLength?: number,
	isRequired?: boolean
	clientError?: string,
	serverError?: string,
	value?: string,
	updateValue: (column: string, value: string, errorMessage?: string) => void,
	readOnly: boolean,
}

const TextInput: React.FC<Props> = props => {
	const classes = useStyle();
	const classesWarning = useStyleWarning();
	const [value, setValue] = useState<string>("");

	React.useEffect(() => {
		setValue(props.value??"");
	}, [props.value]);

	const changeText = (e: any) => {
		setValue(e.target.value);
	}

	const updateText = (e: any) => {
		let value = e.target.value;

		if(props.value === value) return;

		props.updateValue(props.column, value, validateText(value, props.isRequired, props.maxLength, props.minLength).message);
	}

	return (
		<form className={props.clientError ? classes.root : classesWarning.root} noValidate autoComplete="off">
			<TextField
				error={Boolean(props.clientError) || Boolean(props.serverError)}
				helperText={props.clientError ? props.clientError : props.serverError}
				label={props.name}
				variant="outlined"
				// variant="filled"
				value={value}
				onChange={changeText}
				onBlur={updateText}
				fullWidth={true}
				multiline
				InputProps={{
					readOnly: props.readOnly,
					// startAdornment: (
					// 	<InputAdornment position="start">
					// 		<AccountCircle />
					// 	</InputAdornment>
					//   ),
				}}
			/>
		</form>
	);
}

export default TextInput;