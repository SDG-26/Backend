import { Router } from 'express';
import * as authorController from '../controllers/authorController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createAuthorSchema, updateAuthorSchema, getAuthorSchema } from '../utils/validators/authorValidator.js';
import { protect, restrictTo } from '../middleware/authMiddleware.js';

const router = Router();

router
  .route('/')
  .get(authorController.getAllAuthors)
  .post(protect, restrictTo('admin'), validate(createAuthorSchema), authorController.createAuthor);

router
  .route('/:id')
  .get(validate(getAuthorSchema), authorController.getAuthor)
  .patch(protect, restrictTo('admin'), validate(updateAuthorSchema), authorController.updateAuthor)
  .delete(protect, restrictTo('admin'), validate(getAuthorSchema), authorController.deleteAuthor);

export default router;
