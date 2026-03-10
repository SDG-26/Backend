import { Router } from 'express';
import { loginSchema, registerSchema } from '#schemas';
import { validateBody } from '#middleware';
import { login, logout, me, register } from '#controllers';

const authRouter = Router();

authRouter.post('/register', validateBody(registerSchema), register);
authRouter.post('/login', validateBody(loginSchema), login);
authRouter.delete('/logout', logout);
authRouter.get('/me', me);

export default authRouter;
