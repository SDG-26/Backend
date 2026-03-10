import { Router } from 'express';
import { isAuthenticated, validateBody } from '#middleware';
import { createPost, deletePost, getAllPosts, getSinglePost, updatePost } from '#controllers';
import { postSchema } from '#schemas';

const postRoutes = Router();

postRoutes.route('/').get(getAllPosts).post(validateBody(postSchema), isAuthenticated, createPost);

postRoutes
  .route('/:id')
  .get(getSinglePost)
  .put(validateBody(postSchema), isAuthenticated, updatePost)
  .delete(isAuthenticated, deletePost);

export default postRoutes;
