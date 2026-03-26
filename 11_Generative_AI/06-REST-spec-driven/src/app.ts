import express from 'express';
import cookieParser from 'cookie-parser';
import { globalErrorHandler } from './middleware/errorMiddleware.js';
import authorRouter from './routes/authorRoutes.js';
import bookRouter from './routes/bookRoutes.js';
import authRouter from './routes/authRoutes.js';
import { AppError } from './utils/appError.js';

const app = express();

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/authors', authorRouter);
app.use('/api/v1/books', bookRouter);

// Handle undefined routes
app.all(/^(?!.*api).*$/, (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
