import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import MuiCheckbox from '@material-ui/core/Checkbox';
import { FormControlLabel } from '@material-ui/core';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: 'flex',
		},
		formControl: {
			margin: theme.spacing(0),
		},
	}),
);

interface Props {
	column: string,
	name: string,
	clientError?: string,
	serverError?: string,
	value?: boolean,
	updateValue: (column: string, value: boolean, errorMessage?: string) => void,
}

const Checkbox: React.FC<Props> = props => {
	const classes = useStyles();

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		props.updateValue(props.column, event.target.checked);
	};

	return (
		<form className={classes.root}>
			<FormControl component="fieldset" className={classes.formControl}>
				<FormControlLabel
					control={
						<MuiCheckbox onChange={handleChange} name={props.column} checked={props.value}/>
					}
					label={props.name}
				/>
			</FormControl>
		</form>
	);
}

export default Checkbox;