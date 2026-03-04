import { type ErrorRequestHandler } from 'express';

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  console.log(`Error: ${err.message}`);
  console.log(err.cause);
  return res.status(err.cause || 500).json({ message: err.message });
};

export default errorHandler;
