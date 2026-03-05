import { type RequestHandler } from 'express';
import { Post } from '#models';
import { z } from 'zod/v4';
// import { type PostDTO } from '#types';
import { blogPostInputSchema, blogPostOutputSchema } from '#schema';

type BlogPostOutputDTO = z.infer<typeof blogPostOutputSchema>;
type BlogPostInputDTO = z.infer<typeof blogPostInputSchema>;

export const getPosts: RequestHandler<{}, BlogPostOutputDTO[]> = async (req, res) => {
  const posts = await Post.find().populate('userId', 'firstName lastName email').lean();
  res.json(posts);
};

export const createPost: RequestHandler<{}, BlogPostOutputDTO, BlogPostInputDTO> = async (req, res) => {
  const { title, content, userId } = req.body;
  const post = await Post.create({ title, content, userId });
  const populatedPost = await post.populate('userId', 'firstName lastName email');
  res.json(populatedPost);
};

export const getPostById: RequestHandler<{ id: string }, BlogPostOutputDTO> = async (req, res) => {
  if (!req.post) throw new Error('Post context lost');
  res.json(req.post);
};

export const updatePost: RequestHandler<{ id: string }, BlogPostOutputDTO, BlogPostInputDTO> = async (req, res) => {
  const {
    body: { title, content, userId }
  } = req;
  const post = req.post;

  if (!post) {
    throw new Error('post context lost');
  }

  post.title = title;

  post.content = content;
  post.userId = userId;
  await post.save();

  const populatedPost = await post.populate('userId', 'firstName lastName email');
  res.json(populatedPost);
};

export const deletePost: RequestHandler<{ id: string }> = async (req, res) => {
  if (!req.post) throw new Error('Post context lost');
  const post = await Post.findByIdAndDelete(req.post.id);
  res.json({ message: 'Post deleted' });
};
