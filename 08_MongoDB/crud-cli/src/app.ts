import { db } from '#db';
import { Command } from 'commander';
import { ObjectId } from 'mongodb';

const products = db('blog').collection('products');

const program = new Command();
program
	.name('ecommerce-cli')
	.description('Simple product CRUD CLI')
	.version('1.0.0');

// CREATE
program
	.command('add')
	.description('Add a new product')
	.argument('<name>', 'Product name')
	.argument('<stock>', 'Stock quantity')
	.argument('<price>', 'Product price')
	.argument('<tags>', 'Comma-separated tags')
	.action(async (name, stockStr, priceStr, tagsStr) => {
		const price = parseFloat(priceStr);
		if (isNaN(price)) {
			console.log('price is not valid');
			return;
		}
		const stock = parseInt(stockStr);
		const tags = tagsStr.split(',');
		const created_at = new Date();

		const result = await products.insertOne({
			name,
			price,
			stock,
			tags,
			created_at,
		});

		console.log('Inserted with ID', result.insertedId);
	});

// READ
program
	.command('list')
	.description('List all products')
	.action(async () => {
		const all = await products.find().toArray();
		console.log(all);
	});

program
	.command('get')
	.description('Get product by ID')
	.argument('<id>', 'Product ID')
	.action(async (id) => {
		const product = await products.findOne({ _id: new ObjectId(id) });
		console.log(product || 'Product not found');
	});

program
	.command('search')
	.description('Search products by tag')
	.argument('<tag>', 'Tag to search by')
	.action(async (tag) => {
		const matches = await products.find({ tags: tag }).toArray();
		console.log(matches);
	});

program
	.command('delete')
	.description('Delete a product by ID')
	.argument('<id>', 'Product ID')
	.action(async (id) => {
		const result = await products.deleteOne({ _id: new ObjectId(id) });
		console.log(
			result.deletedCount ? 'Product deleted' : 'Product not found',
		);
	});

program
	.command('update')
	.description('Update a product by ID')
	.argument('<id>', 'Product ID')
	.argument('<name>', 'new name')
	.argument('<stock>', 'new quantity')
	.argument('<price>', 'new price')
	.argument('<tags>', 'new Comma-separated tags')
	.action(async (id, name, stockStr, priceStr, tagsStr) => {
		const price = parseFloat(priceStr);
		if (isNaN(price)) {
			console.log('price is not valid');
			return;
		}
		const stock = parseInt(stockStr);
		const tags = tagsStr.split(',');

		const result = await products.updateOne(
			{ _id: new ObjectId(id) },
			{
				$set: { name, price, stock, tags },
			},
		);
		console.log(
			result.matchedCount ? 'Product updated' : 'Product not found',
		);
	});

program.hook('postAction', () => process.exit(0));
program.parse();
