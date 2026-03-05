import { type RequestHandler } from 'express';
import { Post, User } from '#models';
import type { userInputSchema, userOutputSchema } from '#schema';
import { z } from 'zod/v4';

type UserInputDTO = z.infer<typeof userInputSchema>;
type UserOutputDTO = z.infer<typeof userOutputSchema>;

export const getUsers: RequestHandler<{}, UserOutputDTO[]> = async (req, res) => {
  const users = await User.find();
  res.json(users);
};

export const createUser: RequestHandler<{}, UserOutputDTO, UserInputDTO> = async (req, res) => {
  const { firstName, lastName, email, password, isActive } = req.body;
  const found = await User.findOne({ email });
  if (found) throw Error('User already exists', { cause: 400 });
  const user = await User.create({ firstName, lastName, email, password });
  res.json(user);
};

export const getUserById: RequestHandler<{ id: string }, UserOutputDTO> = async (req, res) => {
  const user = req.user;
  if (!user) throw new Error('user context lost');
  res.json(user);
};

export const updateUser: RequestHandler<{ id: string }, UserOutputDTO, UserInputDTO> = async (req, res) => {
  const { body } = req;
  const { firstName, lastName, email } = body;

  const user = req.user;
  if (!user) throw new Error('User context lost');

  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  await user.save();
  res.json(user);
};

export const deleteUser: RequestHandler<{ id: string }> = async (req, res) => {
  const user = req.user;
  if (!user) throw new Error('user context lost');

  const session = await User.startSession();
  session.startTransaction();
  try {
    const deletedUser = await User.findByIdAndDelete(req.user.id, { session });
    if (!deletedUser) throw new Error('User not found');

    const posts = await Post.deleteMany({ userId: user._id }, { session });
    await session.commitTransaction();
    res.json({ message: 'User and associated posts deleted' });
  } catch (error) {
    await session.abortTransaction();
    throw Error('Deleting user failed');
  } finally {
    await session.endSession();
  }
};
