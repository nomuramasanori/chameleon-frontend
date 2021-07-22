import axios from 'axios';

const environment = () => {
	if (process.env.NODE_ENV === 'production') {
		// production
		return {
			api: {
				url: process.env.REACT_APP_PROD_API_URL
			}
		}
	}

	// development
	return {
		api: {
			url: process.env.REACT_APP_DEV_API_URL
		}
	}
}

export const Environment = environment()

export const getHost = (app: string) => {
	return (async() => {
		let res = await axios.get(`${Environment.api.url}/host/${app}`);
		return res.data as string;
	})();
}
