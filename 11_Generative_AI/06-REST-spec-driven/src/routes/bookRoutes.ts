import { Router } from 'express';
import * as bookController from '../controllers/bookController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createBookSchema, updateBookSchema, getBookSchema, listBooksSchema } from '../utils/validators/bookValidator.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

router
  .route('/')
  .get(validate(listBooksSchema), bookController.listBooks)
  .post(protect, restrictTo('admin'), validate(createBookSchema), bookController.createBook);

router
  .route('/:id')
  .get(validate(getBookSchema), bookController.getBook)
  .patch(protect, restrictTo('admin'), validate(updateBookSchema), bookController.updateBook)
  .delete(protect, restrictTo('admin'), validate(getBookSchema), bookController.deleteBook);

export default router;
