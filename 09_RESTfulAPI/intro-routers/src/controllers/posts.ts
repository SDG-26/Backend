import type { Request, Response } from 'express';
import { Post } from '#models';
import { isValidObjectId } from 'mongoose';

export async function getPosts(req: Request, res: Response) {
	const posts = await Post.find();
	res.json(posts);
}

export async function getPostWithId(req: Request, res: Response) {
	const { id } = req.params;
	if (!isValidObjectId(id)) {
		return res.json({ message: 'Id not valid' });
	}

	const post = await Post.findById(id);

	if (!post) {
		return res.json({ message: 'Post not found' });
	}

	return res.json(post);
}
