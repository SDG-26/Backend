import { User } from '#models';
import type { NextFunction, Request, Response } from 'express';
export async function userExists(req: Request, res: Response, next: NextFunction) {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) throw new Error('No user found', { cause: 404 });
  req.user = user;
  next();
}
