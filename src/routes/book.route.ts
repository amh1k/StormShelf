import { Router, type Router as ExpressRouter } from "express";
import {
  addBook,
  deleteBook,
  getBooks,
  updateBook,
} from "../controllers/book.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/adminAuth.middlware.js";
import { upload } from "../middleware/multer.middleware.js";

const router: ExpressRouter = Router();

const coverImageUpload = upload.fields([
  {
    name: "coverImage",
    maxCount: 1,
  },
]);

router
  .route("/create-book")
  .post(verifyJWT, isAdmin, coverImageUpload, addBook);
router
  .route("/:bookId")
  .patch(verifyJWT, isAdmin, coverImageUpload, updateBook);
router.route("/:bookId").delete(verifyJWT, isAdmin, deleteBook);
router.route("/all-books").get(verifyJWT, getBooks);

export default router;
