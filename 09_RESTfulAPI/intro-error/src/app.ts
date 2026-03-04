import express from 'express';
import { postRouter, userRouter } from '#routes';
import '#db';
import { errorHandler } from '#middlewares';

const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get('/error', (req, res) => {
  throw new Error('Something went wrong', { cause: 418 });
});

app.get('/error-async', async (req, res) => {
  throw new Error('Something went wrong in async');
});

app.use('/users', userRouter);
app.use('/posts', postRouter);

app.use('*splat', (req, res, next) => {
  throw new Error('Not Found', { cause: 404 });
});

app.use(errorHandler);

app.listen(port, () => console.log(`\x1b[34mMain app listening at http://localhost:${port}\x1b[0m`));
