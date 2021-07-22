import React from 'react';
import { Link } from '@material-ui/core';
import Icon, { MuiIcon } from './Icon';

interface Props {
	name: string,
	value: string,
	iconName: MuiIcon,
}

const HyperLink: React.FC<Props> = props => {
	return (
		<form>
			<Link href={props.value}>
				<div style={{
					display: 'flex',
					alignItems: 'center',
					flexWrap: 'wrap',
				}}>
					<Icon iconName={props.iconName} fontSize='default' />
					{props.name}
					{" "}
					{props.value}
				</div>
			</Link>
		</form>
	);
}

export default HyperLink;