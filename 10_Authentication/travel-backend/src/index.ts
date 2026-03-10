import express from 'express';
import '#db';
import { errorHandler } from '#middleware';
import { postRoutes, authRoutes } from '#routes';
import cookieParser from 'cookie-parser';

const app = express();
const port = process.env.PORT || 8000;

app.use(express.json(), cookieParser());
app.use('/posts', postRoutes);
app.use('/auth', authRoutes);

app.use('/*splat', (_req, res) => {
  res.status(404).json({ error: 'Not found' });
});
app.use(errorHandler);

app.listen(port, () => console.log(`Server listening on http://localhost:${port}`));
