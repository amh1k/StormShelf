import mongoose, {Schema} from "mongoose";
const favouriteSchema = Schema(
    {
        user:{
            type:Schema.Types.ObjectId,
            ref: "User",
            required: true
            
        },
        book: {
            type: Schema.Types.ObjectId,
            ref: "Book",
            required: true
        }
    },
    {timestamps: true}
)
favouriteSchema.index({ user: 1, book: 1 }, { unique: true });

export const Favourites = mongoose.model("Favourites", favouriteSchema)