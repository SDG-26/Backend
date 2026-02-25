import '#db';
import { Product, User, Order } from '#models';
import { Types } from 'mongoose';
import type { ProductType, UserType, OrderType } from '#types';

const newProducts: ProductType[] = [
	{ name: 'banana', price: 2.5, stock: 100, tags: ['fruits'] },
	{ name: 'cherry', price: 2.2, stock: 423, tags: ['fruits'] },
];

// try {
// 	const insertedProducts = await Product.insertMany(newProducts);
// 	console.log(insertedProducts);
// } catch (error) {
// 	if (error instanceof Error) {
// 		console.log('Something went wrong', error.message);
// 	} else {
// 		console.log('unknown error occured');
// 	}
// }

// try {
// 	const products = await Product.find();
// 	console.log('products');
// 	products.forEach((product) => console.log(product));
// } catch (error) {
// 	if (error instanceof Error) {
// 		console.log('Something went wrong', error.message);
// 	} else {
// 		console.log('unknown error occured');
// 	}
// }

const newUsers: UserType[] = [
	{
		name: 'karl',
		age: 20,
		isActive: true,
		email: 'karl@example.org',
		address: {
			street: 'rue de avignon',
			city: 'paris',
		},
	},
	{
		name: 'hannah',
		age: 30,
		email: 'hannah@example.org',
		address: {
			street: 'lindenstrasse',
			city: 'berlin',
		},
	},
];

// try {
// 	const users = await User.find();
// 	console.log(users);
// } catch (error) {
// 	if (error instanceof Error) {
// 		console.log('Something went wrong', error.message);
// 	} else {
// 		console.log('unknown error occured');
// 	}
// }
// try {
// 	const users = await User.find({
// 		'address._id': '699ec46189bb0b11ddd3de26',
// 	});
// 	console.log(users);
// } catch (error) {
// 	if (error instanceof Error) {
// 		console.log('Something went wrong', error.message);
// 	} else {
// 		console.log('unknown error occured');
// 	}
// }

const newOrder: OrderType = {
	customer: new Types.ObjectId('699ec46189bb0b11ddd3de66'),
	products: [
		new Types.ObjectId('699ec1453a4a0c2b301b7d29'),
		new Types.ObjectId('699ec1453a4a0c2b301b7d2a'),
	],
};

// try {
// 	const insertedOrder = await Order.insertOne(newOrder);
// 	console.log(insertedOrder);
// } catch (error) {
// 	if (error instanceof Error) {
// 		console.log('Something went wrong', error.message);
// 	} else {
// 		console.log('unknown error occured');
// 	}
// }
try {
	const orders = await Order.find().populate(['customer', 'products']);
	console.log(orders);
	console.log(orders[0]?.products);
} catch (error) {
	if (error instanceof Error) {
		console.log('Something went wrong', error.message);
	} else {
		console.log('unknown error occured');
	}
}
