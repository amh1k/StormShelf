import mongoose, {Schema} from "mongoose";

const bookSchema = new Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    }
    ,
    author: {
        type: String,
        required: true,
        lowercase: true,
        
    },
    description: {
        type: String,
        default: "No description provided"
    },
    isbn: {
        type: String,
        required: true,
        trim: true,
        unique: true

    },
    genre: {
        type: String,
        trim: true
    },
   coverImage: {
  url: { type: String },
  public_id: { type: String }
},
    publishedDate: {
        type: Date,
        
    }



},
{timestamps: true}
)

export const Book = mongoose.model("Book", bookSchema)
