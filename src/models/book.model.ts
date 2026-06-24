import mongoose, { Schema, type HydratedDocument } from "mongoose";

interface ICoverImage {
  url?: string;
  public_id?: string;
}

interface IBook {
  title: string;
  author: string;
  description: string;
  isbn: string;
  genre?: string;
  coverImage: ICoverImage;
  publishedDate?: Date;
}

type IBookDocument = HydratedDocument<IBook>;

const bookSchema = new Schema<IBook>(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    author: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      default: "No description provided",
    },
    isbn: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    genre: {
      type: String,
      trim: true,
    },
    coverImage: {
      url: { type: String },
      public_id: { type: String },
    },
    publishedDate: {
      type: Date,
    },
  },
  { timestamps: true },
);

const Book = mongoose.model<IBook>("Book", bookSchema);

export { Book };
export type { IBook, IBookDocument, ICoverImage };
