import type { PipelineStage } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Book } from "../models/book.model.js";
import { Reviews } from "../models/review.model.js";

interface ReviewParams {
  bookId: string;
}

interface ReviewBody {
  rating?: number;
  description?: string;
}

interface PaginationQuery {
  page?: string;
  limit?: string;
}

interface BookRating {
  bookId: unknown;
  title: string;
  author: string;
  avgRating: number;
  totalReviews: number;
}

const ratingPipeline = (): PipelineStage[] => [
  {
    $group: {
      _id: "$book",
      avgRating: { $avg: "$rating" },
      totalReviews: { $sum: 1 },
    },
  },
  {
    $lookup: {
      from: "books",
      localField: "_id",
      foreignField: "_id",
      as: "book",
    },
  },
  { $unwind: "$book" },
  {
    $project: {
      _id: 0,
      bookId: "$book._id",
      title: "$book.title",
      author: "$book.author",
      avgRating: { $round: ["$avgRating", 2] },
      totalReviews: 1,
    },
  },
];

const addReview = asyncHandler<ReviewParams, unknown, ReviewBody>(
  async (req, res) => {
    const userId = req.user?._id;
    const { rating, description = "" } = req.body;

    if (!userId) {
      throw new ApiError(401, "User not authenticated");
    }
    if (rating === undefined || rating < 1 || rating > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }
    if (!(await Book.exists({ _id: req.params.bookId }))) {
      throw new ApiError(404, "Book not found");
    }
    if (await Reviews.exists({ user: userId, book: req.params.bookId })) {
      throw new ApiError(409, "Book is already reviewed by the user");
    }

    const review = await Reviews.create({
      user: userId,
      book: req.params.bookId,
      rating,
      description,
    });
    return res
      .status(201)
      .json(new ApiResponse(201, review, "Review created successfully"));
  },
);

const deleteReview = asyncHandler<ReviewParams>(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const review = await Reviews.findOneAndDelete({
    user: userId,
    book: req.params.bookId,
  });
  if (!review) {
    throw new ApiError(404, "Review not found for this user and book");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, review, "Review deleted successfully"));
});

const getAllBooksAvgRating = asyncHandler(async (_req, res) => {
  const averageRatings = await Reviews.aggregate<BookRating>(ratingPipeline());
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        averageRatings,
        "Average ratings compiled successfully",
      ),
    );
});

const getTopBooks = asyncHandler<
  Record<string, never>,
  unknown,
  unknown,
  PaginationQuery
>(async (req, res) => {
  const page = Math.max(Number.parseInt(req.query.page ?? "1", 10) || 1, 1);
  const limit = Math.max(Number.parseInt(req.query.limit ?? "5", 10) || 5, 1);

  const topBooks = await Reviews.aggregate<BookRating>([
    ...ratingPipeline(),
    { $sort: { avgRating: -1 } },
    { $skip: (page - 1) * limit },
    { $limit: limit },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, topBooks, "Top-rated books fetched successfully"),
    );
});

export { addReview, deleteReview, getAllBooksAvgRating, getTopBooks };
