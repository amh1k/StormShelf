import { Router, type Router as ExpressRouter } from "express";
import {
  addToFavourites,
  deleteFromFavourites,
  getAllFavourites,
} from "../controllers/favourites.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router: ExpressRouter = Router();

router.route("/:bookId").post(verifyJWT, addToFavourites);
router.route("/:bookId").delete(verifyJWT, deleteFromFavourites);
router.route("/all").get(verifyJWT, getAllFavourites);

export default router;
