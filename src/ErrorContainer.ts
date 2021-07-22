type Error = {
	row: number
	column: string,
	message: string
}

export class BlockErrorContainer {
	private errors: Error[];

	constructor();
	constructor(errors: Error[])
	constructor(errors?: Error[]){
		if(errors){
			this.errors = errors;
		} else {
			this.errors = [];
		}
	}

	getErrors = () => {
		return this.errors;
	}

	count = () => {
		return this.errors.length;
	}

	exists = (row: number, column: string)=>{
		return this.getError(row, column) ? true : false;
	}

	getError = (row: number, column: string) => {
		return this.errors.find(error => {return error.row === row && error.column === column});
	}

	add = (row: number, column: string, message: string) => {
		let error = this.getError(row, column);

		if(error) {
			error.message = message;
		} else {
			this.errors.push({row, column, message});
		}
	}
	add2 = (row: number, errors: {column: string, message: string}[]) => {
		errors.forEach(error => {
			let existingError = this.getError(row, error.column);

			if(existingError) {
				existingError.message = error.message;
			} else {
				this.errors.push({row, column: error.column, message: error.message});
			}
		})
	}

	remove = (row: number, column: string) => {
		let error = this.getError(row, column);

		if(error) {
			this.errors = this.errors.filter(error => {return !(error.row === row && error.column === column)});
		}
	}
	remove2 = (row: number) => {
		this.errors = this.errors.filter(error => {return error.row !== row});
	}

	renumber = (action: string, row: number) => {
		switch (action) {
			case 'insert':
				this.errors.forEach(error => {
					if (error.row >= row) {
						error.row++;
					}
				});
				break;
			case 'delete':
				this.errors.forEach(error => {
					if (error.row >= row) {
						error.row--;
					}
				});
				break;
			default:
				break;
		}
	}

	clone = () => {
		let clonedErrors = JSON.parse(JSON.stringify(this.errors));
		return new BlockErrorContainer(clonedErrors);
	}
}

export class ContentErrorContainer {
	private errors: {[key: string]: BlockErrorContainer} = {};

	constructor();
	constructor(errors: {[key: string]: Error[]})
	constructor(errors?: {[key: string]: Error[]}){
		if(errors){
			for(let key in errors) {
				this.errors[key] = new BlockErrorContainer(errors[key]);
			}
		}
	}

	exists = () => {
		let result = false;

		for(let key in this.errors) {
			if(this.errors[key].count()){
				result = true;
				break;
			}
		}

		return result;
	}

	getError = (block: string, row: number, column: string) => {
		return this.getBlockErrors(block)?.getError(row, column);
	}

	getBlockErrors = (block: string) => {
		// return this.errors[block];
		if(!(this.errors[block])){
			this.errors[block] = new BlockErrorContainer();
		}
		return this.errors[block];
	}

	setBlockErrors = (block: string, blockErrors: BlockErrorContainer) => {
		this.errors[block] = blockErrors;
	}

	add = (block: string, row: number, column: string, message: string) => {
		let blockErrors = this.getBlockErrors(block);
		if(blockErrors) {
			blockErrors.add(row, column, message);
		} else {
			blockErrors = new BlockErrorContainer();
			this.errors[block] = blockErrors;
			blockErrors.add(row, column, message);
		}
	}

	remove = (block: string, row: number, column: string) => {
		let error = this.getError(block, row, column);

		if(error) {
			this.getBlockErrors(block)?.remove(row, column);
		}
	}

	clone = () => {
		let clonedErrors: {[key: string]: Error[]} = {};
		for (const key in this.errors) {
			clonedErrors[key] = this.errors[key].clone().getErrors();
		}
		return new ContentErrorContainer(clonedErrors);
	}

	count = () => {
		let count = 0;
		for (const key in this.errors) {
			count += this.errors[key].count();
		}
		return count;
	}
}