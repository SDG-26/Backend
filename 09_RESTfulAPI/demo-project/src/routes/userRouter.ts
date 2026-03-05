import { Router } from 'express';
import { getUsers, createUser, getUserById, updateUser, deleteUser } from '#controllers';
import { validateBodyZod } from '#middleware';
import { userInputSchema } from '#schema';
import { userExists } from '#middleware';

const userRouter = Router();

userRouter.get('/', getUsers);
userRouter.post('/', validateBodyZod(userInputSchema), createUser);
userRouter.get('/:id', userExists, getUserById);
userRouter.put('/:id', validateBodyZod(userInputSchema), userExists, updateUser);
userRouter.delete('/:id', userExists, deleteUser);

export default userRouter;
