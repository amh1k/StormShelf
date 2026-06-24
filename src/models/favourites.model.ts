import mongoose, { Schema, type Types } from "mongoose";

interface IFavourite {
  user: Types.ObjectId;
  book: Types.ObjectId;
}

const favouriteSchema = new Schema<IFavourite>(
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
  },
  { timestamps: true },
);

favouriteSchema.index({ user: 1, book: 1 }, { unique: true });

const Favourites = mongoose.model<IFavourite>("Favourites", favouriteSchema);

export { Favourites };
export type { IFavourite };
