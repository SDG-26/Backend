import { Post } from '#models';
import type { NextFunction, Request, Response } from 'express';
export async function postExists(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  const post = await Post.findById(id);
  if (!post) throw new Error('No post found', { cause: 404 });
  req.post = post;
  next();
}
