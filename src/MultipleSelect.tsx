import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    formControl: {
    //   margin: theme.spacing(1),
      minWidth: 120,
    //   maxWidth: 300,
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
  }),
);

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    //   width: 250,
    },
  },
};

interface Option {
	Id: string,
	Name: string
}

interface Props {
	column: string,
	name: string,
	clientError?: string,
	serverError?: string,
	value?: string[],
	updateValue: (column: string, value: string[], errorMessage?: string) => void,
	options: Option[]
}

const MultipleSelect: React.FC<Props> = props => {
	const classes = useStyles();
	const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
	const inputLabelElement = React.useRef<HTMLLabelElement>(null);

	React.useEffect(() => {
		if(props.value)	setSelectedItems(props.value);
	}, [props.value]);

	const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		setSelectedItems(event.target.value as string[]);
		// props.updateValue(props.column, event.target.value as string[]);
	};

	const handleClose = () => {
		props.updateValue(props.column, selectedItems);
	};

	return (
		<div>
			<FormControl fullWidth variant="outlined" className={classes.formControl}>
				<InputLabel
					id="demo-mutiple-checkbox-label"
					ref={inputLabelElement}
					htmlFor="outlinedInput"
				>Tag</InputLabel>
				<Select
					labelId="demo-mutiple-checkbox-label"
					id="demo-mutiple-checkbox"
					multiple
					value={selectedItems}
					onChange={handleChange}
					onClose={handleClose}
					input={<OutlinedInput
						labelWidth={inputLabelElement.current?.offsetWidth}
                		name="outlinedInput"
                		id="outlinedInput"
					/>}
					renderValue={selected => (
						selected as string[]).join(', ')
					}
					MenuProps={MenuProps}
				>
					{props.options.map(option => (
						<MenuItem key={option.Id} value={option.Id}>
							<Checkbox checked={selectedItems.indexOf(option.Id) > -1} />
							<ListItemText primary={option.Name} />
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
}

export default MultipleSelect;