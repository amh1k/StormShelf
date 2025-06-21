import { Router } from "express";
import { addReview, deleteReview } from "../controllers/review.controllers.js";
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

export default router