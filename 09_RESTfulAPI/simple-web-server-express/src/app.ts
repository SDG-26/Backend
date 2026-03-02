import '#db';
import express, { type Request } from 'express';
import { Post } from '#models';
import { type PostType } from '#types';
import { isValidObjectId } from 'mongoose';

const app = express();

const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/posts', async (req, res) => {
	const posts = await Post.find();
	res.json(posts);
});

app.get('/posts/:id', async (req, res) => {
	const { id } = req.params;
	if (!isValidObjectId(id)) {
		return res.json({ message: 'Id not valid' });
	}

	const post = await Post.findById(id);

	if (!post) {
		return res.json({ message: 'Post not found' });
	}

	return res.json(post);
});

app.post('/posts', async (req: Request<{}, {}, PostType>, res) => {
	const { body } = req;
	if (!body.title || !body.content) {
		return res.json({ message: 'Invalid request body' });
	}
	const post = new Post(body);
	await post.save();
	return res.json(post);
});

app.put(
	'/posts/:id',
	async (req: Request<{ id: string }, {}, PostType>, res) => {
		const { id } = req.params;
		const { body } = req;
		if (!isValidObjectId(id)) {
			return res.json({ message: 'Id not valid' });
		}

		const updatedPost = await Post.findByIdAndUpdate(id, body, {
			returnDocument: 'after',
		});
		console.log(updatedPost);

		if (!updatedPost) return res.json({ message: 'Post not found' });
		res.json(updatedPost);
	},
);

app.delete('/posts/:id', async (req, res) => {
	const { id } = req.params;
	if (!isValidObjectId(id)) {
		return res.json({ message: 'Id not valid' });
	}

	const post = await Post.findByIdAndDelete(id);

	if (!post) {
		return res.json({ message: 'Post not found' });
	}

	return res.json({ message: 'Post deleted' });
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
