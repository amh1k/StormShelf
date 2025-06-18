import { Router } from "express";
import { addToFavourites, deleteFromFavourites } from "../controllers/favourites.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();


//secured routes
router.route("/:bookId").post(verifyJWT, addToFavourites);
router.route("/:bookId").delete(verifyJWT, deleteFromFavourites)

export default router
