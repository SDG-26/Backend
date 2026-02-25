import mongoose from 'mongoose';

try {
	await mongoose.connect(envOrThrow('MONGO_URI'), {
		dbName: 'demo',
	});
	console.log('connected to db');
} catch (error) {
	console.log('MongoDB connection error', error);
	process.exit(1);
}

function envOrThrow(key: string) {
	if (!process.env[key]) {
		throw new Error(`${key} is missing in .env`);
	}

	return process.env[key];
}
