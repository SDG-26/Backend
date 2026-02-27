import express, { type Request } from 'express';

const app = express();

app.use(express.json());

type PostRequestBody = {
	title: string;
	content: string;
};

type PostResponseBody = {
	message: string;
};
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
	res.json({ message: 'Home' });
});

app.get('/posts', (req, res) => {
	res.json({ posts: [] });
});

app.get('/posts/:id', (req, res) => {
	const id = req.params.id;
	res.json({ message: `Post with id ${id}` });
});

app.post(
	'/posts',
	(req: Request<{}, PostResponseBody, PostRequestBody>, res) => {
		res.json({ message: 'Post created' });
	},
);

app.put('/posts/:id', (req, res) => {
	res.json({ message: 'Post updated' });
});

app.delete('/posts/:id', (req, res) => {
	res.json({ message: 'Post deleted' });
});

app.use('/*splat', (req, res) => {
	res.status(404).json({ message: 'not found' });
});

app.listen(port, () => {
	console.log(`Server is listening on http://localhost:${port}`);
});

// type Custom<T = any, Z = any, X = any> = {
// 	params: T;
// 	resBody: Z;
// 	reqBody: X;
// };

// const myCustom: Custom<string, number, boolean> = {
// 	params: 'hello',
// 	resBody: 20,
// 	reqBody: true,
// };

// const myCustom2: Custom<string, string, string> = {
// 	params: 'hello',
// 	resBody: 'world',
// 	reqBody: 'hello',
// };

// const myCustom3: Custom<{ id: string }, { body: string }, {}> = {
// 	params: { id: '1' },
// 	resBody: { body: 'hello' },
// 	reqBody: 2,
// };
