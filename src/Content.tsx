import React from 'react';
import {RouteComponentProps} from 'react-router-dom'
import { Record } from './ContentData'
import ContentBody from './ContentBody'

type Props = {} & RouteComponentProps<{
	app: string,
	content:string
}, any, Record>;

const Content: React.FC<Props> = props => {
    const [current, setCurrent] = React.useState<{app: string, content: string, condition: any}>({
        app: '',
        content: '',
        condition: {}
    });

	React.useEffect(() => {
        setCurrent({
            app: props.match.params.app,
            content: props.match.params.content,
            condition: props.location.state??{}
        });
	}, [props]);

	return (
		<div>
             <ContentBody
				app={current.app}
				content={current.content ?? 'Home'}
				condition={current.condition}
				history={props.history}
                // 画面遷移で遷移前の画面コンポーネントを破棄するために必要
				key={`${current.app}-${current.content}`}
			 />
		</div>
	);
}

export default Content;