import { MongoClient } from 'mongodb';

const client = new MongoClient(process.env.MONGO_URI!);

try {
	await client.connect();
	console.log('connected');
} catch (error) {
	console.log('MongoDB Connection error', error);
	process.exit(1);
}

export const db = (database: string) => client.db(database);
