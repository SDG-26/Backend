import { db } from './db/index.ts';
import { ObjectId } from 'mongodb';

const posts = db('events-db').collection('posts');

const result = await posts.find().toArray();
console.log(result);

const secondPost = await posts
	.find({ _id: new ObjectId('699d64e53ac658a67c533216') })
	.toArray();

console.log(secondPost);
