import mongoose, { Schema } from "mongoose";
const reviewSchema = Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true

    },
    book: {
        type: Schema.Types.ObjectId,
        ref: "Book",
        required: true
    },
    rating: {
        required: true,
        type: Number,

    },
    comments: {
        type: String,
        default: "",
    }

})

export const Reviews = mongoose.model("Reviews", reviewSchema);
