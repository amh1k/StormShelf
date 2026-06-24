import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt, { type JwtPayload } from "jsonwebtoken";
import type { Types } from "mongoose";

interface AuthBody {
  email?: string;
  username?: string;
  password?: string;
}

interface RefreshTokenBody {
  refreshToken?: string;
}

interface ChangePasswordBody {
  oldPassword?: string;
  newPassword?: string;
}

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
};

const generateAccessAndRefreshToken = async (
  userId: Types.ObjectId,
): Promise<Tokens> => {
  const user = await User.findById(userId);
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }

  const accessToken = await user.generateAccessToken();
  const refreshToken = await user.generateRefreshToken();
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  return { accessToken, refreshToken };
};

const registerUser = asyncHandler<Record<string, never>, unknown, AuthBody>(
  async (req, res) => {
    const { email, username, password } = req.body;
    if (!email?.trim() || !username?.trim() || !password?.trim()) {
      throw new ApiError(400, "Email, username and password are required");
    }

    if (await User.exists({ $or: [{ username }, { email }] })) {
      throw new ApiError(409, "User already exists");
    }

    const user = await User.create({ email, username, password, role: "user" });
    const createdUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );
    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  },
);

const loginUser = asyncHandler<Record<string, never>, unknown, AuthBody>(
  async (req, res) => {
    const { email, username, password } = req.body;
    if ((!email?.trim() && !username?.trim()) || !password?.trim()) {
      throw new ApiError(400, "Email or username and password are required");
    }

    const user = await User.findOne({
      $or: [...(username ? [{ username }] : []), ...(email ? [{ email }] : [])],
    });
    if (!user || !(await user.isPasswordCorrect(password))) {
      throw new ApiError(401, "Invalid credentials");
    }

    const tokens = await generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select(
      "-password -refreshToken",
    );

    return res
      .status(200)
      .cookie("accessToken", tokens.accessToken, cookieOptions)
      .cookie("refreshToken", tokens.refreshToken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, ...tokens },
          "User logged in successfully",
        ),
      );
  },
);

const logoutUser = asyncHandler(async (req, res) => {
  if (!req.user) {
    throw new ApiError(401, "User not authenticated");
  }

  await User.findByIdAndUpdate(req.user._id, {
    $unset: { refreshToken: 1 },
  });
  return res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const refreshAccessToken = asyncHandler<
  Record<string, never>,
  unknown,
  RefreshTokenBody
>(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken ?? req.body.refreshToken;
  const secret = process.env.REFRESH_TOKEN_SECRET;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "Refresh token required");
  }
  if (!secret) {
    throw new ApiError(500, "Refresh token secret is not configured");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, secret) as JwtPayload;
    const user = await User.findById(decodedToken._id);
    if (!user || incomingRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "Invalid refresh token");
    }

    const tokens = await generateAccessAndRefreshToken(user._id);
    return res
      .status(200)
      .cookie("accessToken", tokens.accessToken, cookieOptions)
      .cookie("refreshToken", tokens.refreshToken, cookieOptions)
      .json(
        new ApiResponse(200, tokens, "Access token refreshed successfully"),
      );
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(401, "Invalid or expired refresh token");
  }
});

const changePassword = asyncHandler<
  Record<string, never>,
  unknown,
  ChangePasswordBody
>(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!req.user || !oldPassword || !newPassword) {
    throw new ApiError(400, "Old and new passwords are required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (!(await user.isPasswordCorrect(oldPassword))) {
    throw new ApiError(401, "Old password is incorrect");
  }

  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

export {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  changePassword,
};
