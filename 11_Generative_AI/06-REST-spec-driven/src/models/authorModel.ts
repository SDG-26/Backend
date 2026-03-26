import mongoose, { Schema, Document } from 'mongoose';

export interface IAuthor extends Document {
  name: string;
  bio?: string;
  birthDate?: Date;
  active: boolean;
}

const authorSchema = new Schema<IAuthor>(
  {
    name: {
      type: String,
      required: [true, 'An author must have a name'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
    },
    bio: {
      type: String,
      trim: true,
    },
    birthDate: {
      type: Date,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for books (to be used later)
authorSchema.virtual('books', {
  ref: 'Book',
  foreignField: 'author',
  localField: '_id',
});

const Author = mongoose.model<IAuthor>('Author', authorSchema);

export default Author;
