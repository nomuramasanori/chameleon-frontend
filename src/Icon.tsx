import React from 'react';
import * as MuiIcons from '@material-ui/icons'

export type MuiIcon = keyof typeof MuiIcons;

interface Props {
	iconName: MuiIcon,
	fontSize: "small" | "inherit" | "default" | "large" | undefined
}

const Icon: React.FC<Props> = props => {
	return (
		<React.Fragment>
			{React.createElement(MuiIcons[props.iconName], { fontSize: props.fontSize })}
		</React.Fragment>
	);
}

export default Icon;