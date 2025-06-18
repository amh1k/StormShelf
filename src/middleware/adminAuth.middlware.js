import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
const isAdmin = asyncHandler((req, res, next) => {
    if (req?.user?.role !== "admin") {
        throw new ApiError(403, "Access denied: Admins only")
    }
    next();
}) 
export {isAdmin}

