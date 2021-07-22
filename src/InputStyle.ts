import { createStyles, makeStyles, Theme } from '@material-ui/core/styles';

export const useStyle = makeStyles((theme: Theme) => createStyles({
	root: {
		// '& > *': {
		// 	margin: theme.spacing(1)
		// }
	}}),
);

export const useStyleWarning = makeStyles((theme: Theme) => createStyles({
	root: {
		// '& > *': {
		// 	margin: theme.spacing(1)
		// },
		'& .MuiFormLabel-root.Mui-error ': {
			color: theme.palette.warning.main
		},
		'& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
			borderColor: theme.palette.warning.main
		},
		'& .MuiFormHelperText-root.Mui-error': {
			color: theme.palette.warning.main
		}
	}}),
);