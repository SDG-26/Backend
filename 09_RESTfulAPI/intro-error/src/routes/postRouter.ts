import { Router, type NextFunction } from 'express';
import { getPosts, createPost, getPostById, updatePost, deletePost } from '#controllers';
import type { Request, Response } from 'express';

const postRouter = Router();

postRouter.get('/', getPosts);
postRouter.post('/', createPost);
postRouter.get('/:id', getPostById);
postRouter.put('/:id', updatePost);
postRouter.delete('/:id', deletePost);

export default postRouter;
