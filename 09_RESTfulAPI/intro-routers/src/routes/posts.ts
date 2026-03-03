import { Router } from 'express';
import { getPosts, getPostWithId } from '#controllers';

const postRouter = Router();

postRouter.get('/', getPosts);
postRouter.post('/', getPostWithId);

postRouter.get('/:id', () => {});

postRouter.put('/:id', () => {});
postRouter.patch('/:id', () => {});
postRouter.delete('/:id', () => {});

// postRouter.get("/users/:id", () =>{})

export default postRouter;
