import { type FilterQuery } from "mongoose";
import { Book, type IBook, type ICoverImage } from "../models/book.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

interface BookParams {
  bookId: string;
}

interface BookBody {
  title?: string;
  author?: string;
  description?: string;
  isbn?: string;
  genre?: string;
  publishedDate?: string;
}

interface BookQuery {
  page?: string;
  limit?: string;
  query?: string;
  genre?: string;
}

type UploadedFiles = Record<string, Express.Multer.File[]>;

const parsePositiveInteger = (
  value: string | undefined,
  fallback: number,
): number => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const getCoverImagePath = (
  files: Express.Multer.File[] | UploadedFiles | undefined,
): string | undefined => {
  if (!files || Array.isArray(files)) return undefined;
  return files.coverImage?.[0]?.path;
};

const addBook = asyncHandler<Record<string, never>, unknown, BookBody>(
  async (req, res) => {
    const {
      title,
      author,
      isbn,
      description = "",
      genre = "",
      publishedDate,
    } = req.body;

    if (!title?.trim() || !author?.trim() || !isbn?.trim()) {
      throw new ApiError(400, "Title, author and ISBN are required");
    }

    const existedBook = await Book.findOne({
      $or: [{ isbn }, { title }],
    });
    if (existedBook) {
      throw new ApiError(400, "Book already exists");
    }

    const coverImageLocalPath = getCoverImagePath(req.files);
    if (!coverImageLocalPath) {
      throw new ApiError(400, "Cover image is missing");
    }

    const uploadedImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!uploadedImage) {
      throw new ApiError(500, "Cover image failed to upload");
    }

    try {
      const book = await Book.create({
        title,
        author,
        description,
        isbn,
        genre,
        publishedDate: publishedDate ? new Date(publishedDate) : undefined,
        coverImage: {
          url: uploadedImage.secure_url || uploadedImage.url,
          public_id: uploadedImage.public_id,
        },
      });

      return res
        .status(201)
        .json(new ApiResponse(201, book, "Book created successfully"));
    } catch (error: unknown) {
      await deleteFromCloudinary(uploadedImage.public_id).catch(
        () => undefined,
      );
      throw error;
    }
  },
);

const updateBook = asyncHandler<BookParams, unknown, BookBody>(
  async (req, res) => {
    const originalBook = await Book.findById(req.params.bookId);
    if (!originalBook) {
      throw new ApiError(404, "Book not found");
    }

    const coverImage: ICoverImage = {
      url: originalBook.coverImage.url,
      public_id: originalBook.coverImage.public_id,
    };
    const newCoverImagePath = getCoverImagePath(req.files);

    if (newCoverImagePath) {
      const uploadedImage = await uploadOnCloudinary(newCoverImagePath);
      if (!uploadedImage) {
        throw new ApiError(500, "Failed to update cover image");
      }

      if (coverImage.public_id) {
        await deleteFromCloudinary(coverImage.public_id);
      }
      coverImage.url = uploadedImage.secure_url || uploadedImage.url;
      coverImage.public_id = uploadedImage.public_id;
    }

    const updatedBook = await Book.findByIdAndUpdate(
      req.params.bookId,
      {
        $set: {
          title: req.body.title ?? originalBook.title,
          author: req.body.author ?? originalBook.author,
          description: req.body.description ?? originalBook.description,
          isbn: req.body.isbn ?? originalBook.isbn,
          genre: req.body.genre ?? originalBook.genre,
          publishedDate: req.body.publishedDate
            ? new Date(req.body.publishedDate)
            : originalBook.publishedDate,
          coverImage,
        },
      },
      { new: true, runValidators: true },
    );

    return res
      .status(200)
      .json(new ApiResponse(200, updatedBook, "Book updated successfully"));
  },
);

const deleteBook = asyncHandler<BookParams>(async (req, res) => {
  const book = await Book.findById(req.params.bookId);
  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  if (book.coverImage.public_id) {
    await deleteFromCloudinary(book.coverImage.public_id);
  }
  await book.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Book deleted successfully"));
});

const getBooks = asyncHandler<
  Record<string, never>,
  unknown,
  unknown,
  BookQuery
>(async (req, res) => {
  const page = parsePositiveInteger(req.query.page, 1);
  const limit = parsePositiveInteger(req.query.limit, 10);
  const filter: FilterQuery<IBook> = {};

  if (req.query.query) {
    const search = req.query.query;
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { author: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (req.query.genre) {
    filter.genre = req.query.genre;
  }

  const books = await Book.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, books, "Books fetched successfully"));
});

export { addBook, deleteBook, updateBook, getBooks };
