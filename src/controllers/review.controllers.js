import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Book } from "../models/book.model.js";
import { User } from "../models/user.model.js";
import { Reviews } from "../models/review.model.js";


const addReview = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user?._id;
    const { rating, description = "" } = req.body;

    if (!bookId) {
        throw new ApiError(404, "Book Id not found")
    }
    if (!userId) {
        throw new ApiError(404, "User Id not found");
    }
    if (!rating) {
        throw new ApiError(400, "Rating required");
    }
    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(404, "Book not found in database")
    }
    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User entry not foud in database");
    }

    const isAlreadyReviewed = await Reviews.findOne({
        user: userId, book: bookId
    })
    if (isAlreadyReviewed) {
        throw new ApiError(400, "Book is already reviewed by the user")
    }
    const createdReview = await Reviews.create(
        {
            user: userId,
            book: bookId,
            rating: rating,
            description: description
        }

    )
    return res.status(200).json(new ApiResponse(200, createdReview, "Review created successfully"));

})
const deleteReview = asyncHandler(async (req, res) => {
    const { bookId } = req.params;
    const userId = req.user?._id;

    if (!bookId) {
        throw new ApiError(400, "Book ID is required");
    }
    if (!userId) {
        throw new ApiError(401, "User not authenticated");
    }

    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(404, "Book not found in the database");
    }

    const review = await Reviews.findOne({ user: userId, book: bookId });
    if (!review) {
        throw new ApiError(404, "Review not found for this user and book");
    }


    await Reviews.deleteOne({ _id: review._id });

    return res.status(200).json(
        new ApiResponse(200, review, "Review deleted successfully")
    );
});

export { addReview, deleteReview }
