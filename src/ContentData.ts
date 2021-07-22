import { ContentErrorContainer} from './ErrorContainer'

type Block = {id: string, records: Record[]};

export type Record = {[key: string]: any};

class ContentData{
	blocks: Block[] = [];
	isCalculated = false;
	serverErrors = new ContentErrorContainer();
	clientErrors = new ContentErrorContainer();

	constructor();
	constructor(blocks: Block[], serverErrors: ContentErrorContainer, clientError?: ContentErrorContainer);
	constructor(blocks?: Block[], serverErrors?: ContentErrorContainer, clientError?: ContentErrorContainer){
		this.blocks = blocks??[];
		this.serverErrors = serverErrors??new ContentErrorContainer();
		this.clientErrors = clientError??new ContentErrorContainer();
	}

	getBlock = (id: string) => {
		return this.blocks.find(block => block.id === id);
	}

	getRecord = (id: string, index: number) => {
		let block = this.getBlock(id);
		if(!block) return null;
		return block.records[index];
	}

	update = (block: string, changes: {row: number, column: string, value: any, errorMessage?: string}[]) => {
		let targetBlock = this.getBlock(block);

		changes.forEach(change => {
			if(targetBlock) {
				targetBlock.records[change.row][change.column] = change.value;
			}

			if(change.errorMessage) {
				this.clientErrors.add(block, change.row, change.column, change.errorMessage);
			} else {
				this.clientErrors.remove(block, change.row, change.column);
			}

			this.serverErrors.remove(block, change.row, change.column);
		});
	}

	insert = (block: string, rows: {index: number, record: Record, errors: {column: string, message: string}[]}[]) => {
		let targetBlock = this.getBlock(block);

		rows.forEach(row => {
			if(!targetBlock) return;
			targetBlock.records.splice(row.index, 0, row.record);
			this.clientErrors.getBlockErrors(block).renumber('insert', row.index);
			this.serverErrors.getBlockErrors(block).renumber('insert', row.index);
			this.clientErrors.getBlockErrors(block).add2(row.index, row.errors);
		});

	}

	delete = (block: string, rows: number[]) => {
		let targetBlock = this.getBlock(block);

		rows.sort((a, b) => b - a).forEach(row => {
			if(!targetBlock) return;
			targetBlock.records.splice(row, 1);
			this.clientErrors.getBlockErrors(block).remove2(row);
			this.clientErrors.getBlockErrors(block).renumber('delete', row);
			this.serverErrors.getBlockErrors(block).renumber('delete', row);
		});
	}

	clone = () => {
		let blocks = JSON.parse(JSON.stringify(this.blocks));
		return new ContentData(blocks, this.serverErrors.clone(), this.clientErrors.clone());
	}

	hasError = () => {
		return this.clientErrors.count() + this.serverErrors.count() ? true : false;
	}
}

export default ContentData;