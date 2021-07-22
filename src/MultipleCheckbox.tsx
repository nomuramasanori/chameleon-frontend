import React from 'react';
import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl';
import MuiCheckbox from '@material-ui/core/Checkbox';
import { Accordion, AccordionDetails, AccordionSummary, FormControlLabel, FormGroup, FormLabel, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme: Theme) =>
	createStyles({
		root: {
			display: 'flex',
		},
		formControl: {
			margin: theme.spacing(1),
			width: '100%'
		},
		accordion: {
			width: '100%',
		},
		heading: {
			fontSize: theme.typography.pxToRem(15),
			fontWeight: theme.typography.fontWeightRegular,
		},
	}),
);

interface Option {
	Id: string,
	Name: string,
	Group: string
}

interface Props {
	column: string,
	name: string,
	clientError?: string,
	serverError?: string,
	value?: string[],
	updateValue: (column: string, value: string[], errorMessage?: string) => void,
	options: Option[],
	grouping: boolean
}

const MultipleCheckbox: React.FC<Props> = props => {
	const classes = useStyles();
	const [selectedItems, setSelectedItems] = React.useState<string[]>([]);

	React.useEffect(() => {
		if(!props.value) return;
		setSelectedItems(props.value);
	}, [props.value]);

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if(event.target.checked) {
			let cloned = selectedItems.concat();
			cloned.push(event.target.name);
			props.updateValue(props.column, cloned);
		} else {
			props.updateValue(props.column, selectedItems.filter(item => item !== event.target.name));
		}
	};

	const groupOption = (options: Option[]) => {
		return options.reduce((acc: any, obj) => {
			let key = obj['Group']
			if (!acc[key]) {
				acc[key] = []
			}
			acc[key].push(obj)
			return acc
		}, {})
	}

	return (
		<form className={classes.root}>
			<FormControl component="fieldset" className={classes.formControl}>
				<FormLabel component="legend">{props.name}</FormLabel>
				<FormGroup row>
					{!props.grouping ? props.options.map(option => (
						<FormControlLabel
							key={option.Id}
							control={
								<MuiCheckbox onChange={handleChange} name={option.Id} />
							}
							label={option.Name}
						/>
					)) : (() => {
						let items = [];
						let groupedOption = groupOption(props.options);
						for (const key in groupedOption) {
							items.push(
								<Accordion key={key} className={classes.accordion}>
									<AccordionSummary
										expandIcon={<ExpandMoreIcon />}
										aria-controls="panel1a-content"
										id="panel1a-header"
									>
										<Typography className={classes.heading}>{key}</Typography>
									</AccordionSummary>
									<AccordionDetails>
										<div>
										{groupedOption[key].map((option: any) => (
											<FormControlLabel
												key={option.Id}
												control={
													<MuiCheckbox onChange={handleChange} name={option.Id} />
												}
												label={option.Name}
											/>
										))}
										</div>
									</AccordionDetails>
								</Accordion>

							);
						}
						return items;
					})()}
				</FormGroup>
			</FormControl>
		</form>
	);
}

export default MultipleCheckbox;