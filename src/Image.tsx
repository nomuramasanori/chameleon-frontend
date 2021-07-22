import { Avatar, Fab } from '@material-ui/core';
import React, { useState } from 'react';
import { useStyle } from './InputStyle';
import EditIcon from '@material-ui/icons/Edit';

interface Props {
	app: string,
	content: string,
	block: string,
	column: string,
    pictureUrl: string,
	updateImage: (block: string, row: number, column: string, url: string, type: string, image: string) => void,
}

const Picture: React.FC<Props> = props => {
	const classes = useStyle();
	const [file, setFile] = useState<any>();

	React.useEffect(() => {
		setFile(props.pictureUrl);
	}, [props.pictureUrl]);

	const uploadFile = (e: any) => {
		let image_url = createObjectURL(e.target.files[0]);
		setFile(image_url);

		// let params = new FormData();
		// params.append('file', e.target.files[0]);

		// axios.post(`${Environment.api.url}/${props.app}/${props.content}/${props.block}/upload-file`, params)
		// .then((response: any) => {
		// 	console.log(response);
		// 	setFile(response.data);
		// })
		// .catch((error :any) => {});

		let type = e.target.files[0].type;

		let fr=new FileReader();
		fr.onload = () => {
			console.log(fr.result);

			let index = (fr.result as string).indexOf(',');
			// ４．基準文字列から後の文字列を切り出して表示
			let base64 = (fr.result as string).slice(index + 1);

			console.log(base64);

			//const base64EncodedFile = (fr.result as string).replace(/data:.*\/.*;base64,/, '');
			props.updateImage(props.block, 0, props.column, props.pictureUrl, type, base64);
		};
		fr.readAsDataURL(e.target.files[0]);
	};

	return (
		<form className={classes.root}>
			<Avatar src={file} />
			<Fab color="secondary" aria-label="edit" component="label" size="small">
				<input accept="image/*" hidden type="file" className="input" id="upload-img" onChange={uploadFile} />
        		<EditIcon />
      		</Fab>
		</form>
	);
}

let createObjectURL = (window.URL || window.webkitURL).createObjectURL;

export default Picture;
