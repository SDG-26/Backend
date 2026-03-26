import { Request, Response, NextFunction } from 'express';
import Book from '../models/bookModel.js';
import { AppError } from '../utils/appError.js';

export const listBooks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Pagination
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    // 2. Search & Filtering
    let query: any = {};
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.author) {
      query.author = req.query.author;
    }

    const books = await Book.find(query)
      .populate('author')
      .skip(skip)
      .limit(limit);

    const total = await Book.countDocuments(query);

    res.status(200).json({
      status: 'success',
      results: books.length,
      page,
      totalPages: Math.ceil(total / limit),
      data: { books },
    });
  } catch (error) {
    next(error);
  }
};

export const getBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await Book.findById(req.params.id).populate('author');
    if (!book) {
      return next(new AppError('No book found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

export const createBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const newBook = await Book.create(req.body);
    res.status(201).json({
      status: 'success',
      data: { book: newBook },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!book) {
      return next(new AppError('No book found with that ID', 404));
    }
    res.status(200).json({
      status: 'success',
      data: { book },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) {
      return next(new AppError('No book found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (error) {
    next(error);
  }
};
