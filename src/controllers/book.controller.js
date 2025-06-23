import { Book } from "../models/book.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";


const addBook = asyncHandler(async (req, res) => {
    let { title, author, description, isbn, genre, publishedDate } = req.body;
    if (!description) {
        description = "";
    }
    if (!genre) {
        genre = "";
    }
    if (!publishedDate) {
        publishedDate = "";
    }
    if ([title, author, isbn].some((field) => field.trim() === "")) {
        throw new ApiError(400, "All fields required");
    }

    const existedBook = await Book.findOne(
        {
            $or: [{ isbn }, { title }]
        }
    )
    if (existedBook) {
        throw new ApiError(400, "Book already exists");
    }
    const coverImageLocalPath = req.files?.coverImage?.[0]?.path;
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover image is missing");
    }
    let coverImage;
    try {
        coverImage = await uploadOnCloudinary(coverImageLocalPath);
        console.log("Cover image uploaded", coverImage);


    }
    catch (err) {
        throw new ApiError(500, "Cover image failed to upload")

    }
    try {
        const book = await Book.create({
            title,
            author,
            description,
            isbn,
            genre,
            publishedDate,
            coverImage: {
                url: coverImage.url,
                public_id: coverImage.public_id // storing public id so that while updating we can delete the prev
                //coverImage 
            }
        })
        const createdBook = await Book.findById(book._id);
        if (!createdBook) {
            throw new ApiError(500, "Something went wrong while accessing database")
        }
        return res.status(200).json(new ApiResponse(200, createdBook, "Book created successfully and added to db"))


    }
    catch (err) {
        console.log("book creation failed");
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id);
        }
        throw new ApiError(500, "Something went wrong while creating book in database");

    }

})

const updateBook = asyncHandler(async (req, res) => {
    const { originalBookId } = req.params;

    const updateData = req.body;
    const originalBook = await Book.findById(originalBookId);
    if (!originalBook) {
        throw new ApiError(404, "originalBook not found");
    }
    let { title = originalBook?.title
        , author = originalBook?.author
        , isbn = originalBook?.isbn
        , genre = originalBook?.genre
        , publishedDate = originalBook?.publishedDate
        , coverImage = originalBook?.coverImage } = req.body;

    const newCoverImagePath = req.files?.coverImage?.[0]?.path;
    if (newCoverImagePath) {
        try {
            if (originalBook.coverImage?.public_id) {
                await deleteFromCloudinary(originalBook.coverImage.public_id);
            }

            const temp = await uploadOnCloudinary(newCoverImagePath);
            coverImage.url = temp?.url;
            coverImage.public_id = temp?.public_id;

        } catch (err) {
            throw new ApiError(500, "Failed to update cover image");
        }
    }
    const updatedBook = await Book.findByIdAndUpdate(
        originalBookId,
        {
            $set: {
                title,
                author,
                isbn,
                genre,
                publishedDate,
                coverImage


            }
        },
        { new: true }
    )



    return res.status(200).json(new ApiResponse(200, updatedBook, "Book updated successfully"));
});


const deleteBook = asyncHandler(async (req, res) => {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
        throw new ApiError(404, "Book not found");
    }
    if (book.coverImage?.public_id) {
        try {
            await deleteFromCloudinary(book.coverImage.public_id);
        } catch (err) {
            console.error("Failed to delete image from Cloudinary", err);
        }
    }

    await Book.findByIdAndDelete(bookId);

    return res.status(200).json(new ApiResponse(200, null, "Book deleted successfully"));
});



const getBooks = asyncHandler(async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { query, genre } = req.query;
    let filter = {};
    if (query) {

        filter.$or = [
            { title: { $regex: query, $options: "i" } },
            { author: { $regex: query, $options: "i" } },
            { description: { $regex: query, $options: "i" } }
        ];


    }
    if (genre) {
        filter.genre = genre;
    }
    const books = await Book.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 });
    return res.status(200).json(new ApiResponse(200, books, "Books fetched successfuly"));

})
export { addBook, deleteBook, updateBook, getBooks }