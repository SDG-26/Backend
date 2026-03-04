import type { Document, InferSchemaType, ObjectId } from 'mongoose';
import { PostType } from '#models/Post';

declare global {
  namespace Express {
    export interface Request {
      customProperty?: string;
      user?: {
        id: number;
        firstName: string;
      };
      post?: PostType;
    }
  }
}

export {};
