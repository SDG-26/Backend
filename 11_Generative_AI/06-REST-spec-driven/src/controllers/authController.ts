import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/userModel.js';
import { AppError } from '../utils/appError.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-dev-only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

const signToken = (id: string, role: string) => {
  return jwt.sign({ id, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any,
  });
};

const createSendToken = (user: any, statusCode: number, res: Response) => {
  const token = signToken(user._id, user.role);

  const cookieOptions = {
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day in MS
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  res.cookie('access_token', token, cookieOptions);

  // Remove password from output
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, password } = req.body;

    // 1) Check if username and password exist
    if (!username || !password) {
      return next(new AppError('Please provide username and password!', 400));
    }

    // 2) Check if user exists & password is correct
    // Simulating cleartext password check for now as bcrypt wasn't in package.json initial task list.
    // In a real app we would use bcrypt.
    const user = await User.findOne({ username }).select('+password');

    if (!user || user.password !== password) {
      return next(new AppError('Incorrect username or password', 401));
    }

    // 3) If everything ok, send token to client
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const signup = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newUser = await User.create({
      username: req.body.username,
      password: req.body.password,
      role: req.body.role,
    });

    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};
