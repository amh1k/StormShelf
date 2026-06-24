import jwt, { type JwtPayload } from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const verifyJWT = asyncHandler(async (req, _res, next) => {
  const token =
    req.cookies.accessToken ??
    req.header("Authorization")?.replace(/^Bearer\s+/i, "");

  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }

  const secret = process.env.ACCESS_TOKEN_SECRET;
  if (!secret) {
    throw new ApiError(500, "Access token secret is not configured");
  }

  try {
    const decodedToken = jwt.verify(token, secret) as JwtPayload;
    const user = await User.findById(decodedToken._id).select(
      "-password -refreshToken",
    );
    if (!user) {
      throw new ApiError(401, "Unauthorized");
    }

    req.user = user;
    next();
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Invalid access token";
    throw new ApiError(401, message);
  }
});

export { verifyJWT };
