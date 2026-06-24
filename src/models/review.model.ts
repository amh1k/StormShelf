import mongoose, { Schema, type Types } from "mongoose";

interface IReview {
  user: Types.ObjectId;
  book: Types.ObjectId;
  rating: number;
  description: string;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    rating: {
      required: true,
      type: Number,
      min: 1,
      max: 5,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

const Reviews = mongoose.model<IReview>("Reviews", reviewSchema);

export { Reviews };
export type { IReview };
