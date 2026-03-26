import mongoose, { Schema, Document } from 'mongoose';

export interface IBook extends Document {
  title: string;
  author: mongoose.Types.ObjectId;
  summary?: string;
  isbn?: string;
  publishedDate?: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: [true, 'A book must have a title'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'Author',
      required: [true, 'A book must belong to an author'],
    },
    summary: {
      type: String,
      trim: true,
    },
    isbn: {
      type: String,
      trim: true,
    },
    publishedDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

const Book = mongoose.model<IBook>('Book', bookSchema);

export default Book;
