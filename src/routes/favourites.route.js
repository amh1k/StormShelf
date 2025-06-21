import { Router } from "express";
import { addToFavourites, deleteFromFavourites, getAllFavourites } from "../controllers/favourites.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";


const router = Router();


//secured routes
router.route("/:bookId").post(verifyJWT, addToFavourites);
router.route("/:bookId").delete(verifyJWT, deleteFromFavourites)
router.route("/all").get(verifyJWT, getAllFavourites)

export default router
