import { Favourites } from "../models/favourites.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Book } from "../models/book.model.js";
import {User} from "../models/user.model.js"

const addToFavourites = asyncHandler(async (req, res) => {
    const {bookId} = req.params;
    const userId = req.user?._id
    if (!bookId) {
        throw new ApiError(400, "Book Id required");
    }
    if (!userId) {
        throw new ApiError(400, "User Id required")
    }
    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(404, "Book not found in db");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found in db");
    }


    const isAlreadyFav = await Favourites.findOne({
        user: userId, book: bookId
    })
    if (isAlreadyFav) {
        throw new ApiError(400, "Book is already favourite of the user")
    }

    const favouriteBook = await Favourites.create(
        {
            user: userId,
            book: bookId,
        }
    )
    return res.status(200).json(new ApiResponse(200, favouriteBook, "Favourite entry created successfully"))
})


const deleteFromFavourites = asyncHandler(async (req, res) => {
    const {bookId} = req.params;
    const userId = req.user?._id
    if (!bookId || !userId) {
        throw new ApiError(400, "User and book id both are required");
    }
    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(404, "Book not found in db");
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found in db");
    }


    const favEntry = await Favourites.findOne({
        user: userId, book: bookId
    })
    if (!favEntry) {
        throw new ApiError(400, "Book is not in favourites so cant delete")
    }
    await Favourites.deleteOne({_id:favEntry._id})

    
    return res.status(200).json(new ApiResponse(200, favEntry, "Favourite entry deleted succcessfuly successfully"))
})

export {addToFavourites, deleteFromFavourites}