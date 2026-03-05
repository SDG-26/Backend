import { Schema, model } from 'mongoose';
import mongoose from 'mongoose';

const postSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      trim: true
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      validate: {
        validator: async (id: string) => {
          const result = await mongoose.model('User').exists({ _id: id });
          return !!result;
        },
        message: 'User does not exist'
      }
    }
  },
  {
    timestamps: true
  }
);

const Post = model('Post', postSchema);
export type PostDocumentType = InstanceType<typeof Post>;
export default Post;
