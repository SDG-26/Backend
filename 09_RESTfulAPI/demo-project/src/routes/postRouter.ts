import { Router, type NextFunction } from 'express';
import { getPosts, createPost, getPostById, updatePost, deletePost } from '#controllers';
import { postExists } from '#middleware';
import { blogPostInputSchema } from '#schema';
import { validateBodyZod } from '#middleware';

const postRouter = Router();

postRouter.get('/', getPosts);
postRouter.post('/', validateBodyZod(blogPostInputSchema), createPost);
postRouter.get('/:id', postExists, getPostById);
postRouter.put('/:id', validateBodyZod(blogPostInputSchema), postExists, updatePost);
postRouter.delete('/:id', postExists, deletePost);

export default postRouter;
