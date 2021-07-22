import { MuiIcon } from "./Icon"

export type TextOption = {
	length: number,
	minLength: number,
	maxLength: number,
}

export type NumberOption = {
	max: number,
	min: number,
	displayDigit: number,
}

export type HyperLinkOption = {
	iconName: MuiIcon
}

export type MultipleSelectOption = {
	grouping: boolean
}

export type ColumnProperty = {
	id: string,
	type: string,
	name: string,
	readOnly: boolean,
	visible: boolean,
	width: 1|2|3|4|5|6|7|8|9|10|11|12,
	required: boolean,
	textOption: TextOption,
	numberOption: NumberOption,
	hyperLinkOption: HyperLinkOption,
	multipleSelectOption: MultipleSelectOption,
	listItems: {
		Id: string,
		Name: string,
		Group: string
	}[],
	listItemType: string,
}

// export type BlockProperty = {
// 	Columns: ColumnProperty[],
// 	HasTransition: boolean
// }

export type Row = {
	size: number,
	Columns: {
		size: 1|2|3|4|5|6|7|8|9|10|11|12,
		Contents: {
			Entity?: any,
			Name: string,
			Id: string,
			CoreData?: any,
			BlockType: string,
			NoFrame: boolean,
			Explain: string
		}[];
		Count: number,
		Rows: Row[],
	}[];
}

export type Layout = {
	Registerable: boolean,
	Rows: Row[],
}

export type Image = {
	block: string,
	row: number,
	column: string,
	url: string,
	type: string,
	image: string,
}