import { Router, type Router as ExpressRouter } from "express";
import { healthCheck } from "../controllers/healthcheck.controller.js";

const router: ExpressRouter = Router();

router.route("/").get(healthCheck);

export default router;
