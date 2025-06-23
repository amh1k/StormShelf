import { Router } from "express";
import { addBook, deleteBook, getBooks, updateBook } from "../controllers/book.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { isAdmin } from "../middleware/adminAuth.middlware.js";
import { upload } from "../middleware/multer.middleware.js";

const router = Router();


//secured routes with admin and login
router.route("/create-book").post(verifyJWT, isAdmin,
    upload.fields(
        [
            {
                name: "coverImage",
                maxCount: 1
            }
        ]
    ),
    addBook

)
router.route("/:id").patch(verifyJWT, isAdmin,
    upload.fields(
        [
            {
                name: "coverImage",
                maxCount: 1
            }
        ]
    ),
    updateBook
)
router.route("/:id").delete(
    verifyJWT,
    isAdmin,
    deleteBook

)

router.route("/all-books").get(
    verifyJWT,
    getBooks
)
export default router

