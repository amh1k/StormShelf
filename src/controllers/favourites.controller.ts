import { Favourites } from "../models/favourites.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Book, type IBook } from "../models/book.model.js";

interface FavouriteParams {
  bookId: string;
}

interface FavouriteQuery {
  page?: string;
  limit?: string;
  sortBy?: "createdAt" | "updatedAt";
  order?: "asc" | "desc";
  genre?: string;
}

const addToFavourites = asyncHandler<FavouriteParams>(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }
  if (!(await Book.exists({ _id: req.params.bookId }))) {
    throw new ApiError(404, "Book not found");
  }

  const existingFavourite = await Favourites.findOne({
    user: userId,
    book: req.params.bookId,
  });
  if (existingFavourite) {
    throw new ApiError(409, "Book is already a favourite");
  }

  const favourite = await Favourites.create({
    user: userId,
    book: req.params.bookId,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, favourite, "Favourite created successfully"));
});

const deleteFromFavourites = asyncHandler<FavouriteParams>(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const favourite = await Favourites.findOneAndDelete({
    user: userId,
    book: req.params.bookId,
  });
  if (!favourite) {
    throw new ApiError(404, "Book is not in favourites");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, favourite, "Favourite deleted successfully"));
});

const getAllFavourites = asyncHandler<
  Record<string, never>,
  unknown,
  unknown,
  FavouriteQuery
>(async (req, res) => {
  const userId = req.user?._id;
  if (!userId) {
    throw new ApiError(401, "User not authenticated");
  }

  const page = Math.max(Number.parseInt(req.query.page ?? "1", 10) || 1, 1);
  const limit = Math.max(Number.parseInt(req.query.limit ?? "10", 10) || 10, 1);
  const sortBy = req.query.sortBy ?? "createdAt";
  const order = req.query.order === "asc" ? 1 : -1;
  const match = req.query.genre ? { genre: req.query.genre } : {};

  const favourites = await Favourites.find({ user: userId })
    .populate<{ book: IBook | null }>({
      path: "book",
      match,
      select: "title author genre publishedDate coverImage",
    })
    .sort({ [sortBy]: order })
    .skip((page - 1) * limit)
    .limit(limit);

  const results = favourites.filter((favourite) => favourite.book !== null);
  const total = await Favourites.countDocuments({ user: userId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { total, page, limit, results },
        "Filtered books fetched successfully",
      ),
    );
});

export { addToFavourites, deleteFromFavourites, getAllFavourites };
