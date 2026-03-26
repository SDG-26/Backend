import { Request, Response, NextFunction } from 'express';
import Author from '../models/authorModel.js';
import { AppError } from '../utils/appError.js';

export const getAllAuthors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authors = await Author.find();
    res.status(200).json({
      status: 'success',
      results: authors.length,
      data: { authors },
    });
  } catch (error) {
    next(error);
  }
};

export const getAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const author = await Author.findById(req.params.id).populate('books');
    if (!author) {
      return next(new AppError('No author found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { author },
    });
  } catch (error) {
    next(error);
  }
};

export const createAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newAuthor = await Author.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { author: newAuthor },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const author = await Author.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!author) {
      return next(new AppError('No author found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { author },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAuthor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const author = await Author.findByIdAndDelete(req.params.id);
    if (!author) {
      return next(new AppError('No author found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
