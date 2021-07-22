export type ValidationResult = {
    isValid: boolean,
    message: string
}

export const validateNumber = (value: number, max: number, min: number) => {
	let isValid = true;
	let message = "";

	if (value !== 0 && (!value || isNaN(value))) {
		//パース可能か？
		isValid = false;
		message = "Not a Number";
	} else {
		let parsedValue = Number(value);

		//最大値を超えているか？
		if (max < parsedValue) {
			isValid = false;
			message = "Exceeds the maximum value";
		}
		//最小値を下回っているか？
		if (parsedValue < min) {
			isValid = false;
			message = "Below the minimum value";
		}
	}

	return {
		isValid: isValid,
		message: message
	} as ValidationResult;
}

export function validateText(value?: string, isRequired?: boolean, maxLength?: number, minLength?: number) {
	let isValid = true;
	let message = "";

	if (isRequired && !value) {
		isValid = false;
		message = "Required";
	}

	//最大桁数を超えているか？
	if (maxLength && maxLength < (value ? value.length : 0)) {
		isValid = false;
		message = "Exceeds the maximum length";
	}
	//最小桁数を下回っているか？
	if (minLength && (value ? value.length : 0) < minLength) {
		isValid = false;
		message = "Below the minimum length";
	}

	return {
		isValid: isValid,
		message: message
	} as ValidationResult;
}