import { Router } from "express";
import { addReview, deleteReview, getAllBooksAvgRating, getTopBooks } from "../controllers/review.controllers.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();


router.route("/:bookId").post(
    verifyJWT,
    addReview
)


router.route("/:bookId").delete(
    verifyJWT,
    deleteReview
)
router.route("/average-ratings").get(
    verifyJWT,
    getAllBooksAvgRating

)
router.route("/top-rating").get(
    verifyJWT,
    getTopBooks

)

export default router