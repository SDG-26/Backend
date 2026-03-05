import type { Document, InferSchemaType, ObjectId } from 'mongoose';
import { PostDocumentType, UserDocumentType } from '#models';

declare global {
  namespace Express {
    export interface Request {
      customProperty?: string;
      user?: UserDocumentType;
      post?: PostDocumentType;
    }
  }
}

export {};
