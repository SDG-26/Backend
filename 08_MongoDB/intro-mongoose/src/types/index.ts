import { Types } from 'mongoose';
export type ProductType = {
	name: string;
	price: number;
	stock: number;
	tags?: string[];
};

export type UserType = {
	name: string;
	age: number;
	isActive?: boolean;
	email: string;
	address: {
		street: string;
		city: string;
	};
};

export type OrderType = {
	customer: Types.ObjectId;
	products: Types.ObjectId[];
};
