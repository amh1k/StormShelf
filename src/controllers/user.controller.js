import { ApiResponse } from "../utils/apiResponse.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose"

const generateAccessAndRefreshToken = async(userId) => {
    try {
        const user = await  User.findById(userId);
        if (!user) {
            console.log("User not found");
            throw new ApiError(500, "User does not exist");

        }
        else {
            const accessToken = await user.generateAccessToken();
            const refreshToken = await user.generateRefreshToken();
            user.refreshToken = refreshToken;
            await user.save({validateBeforeSave: false});
            return {accessToken, refreshToken};
        }

    }
    catch(err) {
        throw new ApiError(500, "Something went wrong while generating access and refresh Tokens");

    }
}


const registerUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body;
    //validating if user has entered all fields needed for registering
    if ([email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields required")
    }
    const existedUser = await User.findOne({
        $or:[{username}, {email}]

    })
    if (existedUser) {
        throw new ApiError(400, "User already exists. Please login in")

    }
    try {
        const user = await User.create({
            email,
            username, 
            password
        })
        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        return res.status(200)
        .json(new ApiResponse(200, createdUser, "User registered successfully"));

    }
    catch(err) {
        console.log("User creation failed");
        throw new ApiError(500, "Something went wrong so could not create user in database")

    }
})

const loginUser = asyncHandler(async (req, res) => {
    const {email, username, password} = req.body;
    if ([email, username, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "Enter email, username and password");
    }
    const user = await User.findOne({
        $or: [{username}, {email}]
    }

    )
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }
    const {accessToken, refreshToken} = await generateAccessAndRefreshToken((user._id));
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");
    if (!loggedInUser) {
        throw new ApiError(404, "Logged in user does not exist");
    }
    const options = {
         httpOnly:true,
        secure:process.env.NODE_ENV === "production",
    }
    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(new ApiResponse(200, {user:loggedInUser, accessToken, refreshToken}), "User logged in successfuly");
    
})
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            refreshToken: undefined
        },
        


    },
    {new: true}
)
const options = {
    httpOnly:true,
    secure:process.env.NODE_ENV === "production",
}
return res.status(200)
.clearCookie("accessToken", options)
.clearCookie("refreshToken", options)
.json(new ApiResponse(200, {}, "user logged out successfully"));
})

const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingRefreshToken) {
        throw new ApiError(401, "Refresh Token required");
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new ApiError(401, "Invalid refresh Token")
        }
        if (incomingRefreshToken !== user?.refreshToken) {
            throw new ApiError(401, "Invalid Refresh Token");
        }
        const options = {
             httpOnly:true,
    secure:process.env.NODE_ENV === "production",
        }
        const {accessToken, refreshToken: newRefreshToken} = await generateAccessAndRefreshToken(user._id);
        return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(new ApiResponse(200, {accessToken, refreshToken: newRefreshToken}, "Access Token refreshed successfully"))

    }
    catch(err) {
        throw new ApiError(500, "something went wrong while refreshing access Token");

    }
})

const changePassword = asyncHandler(async(req, res) => {
     const {oldPassword, newPassword} = req.body
    const user = await User.findById(req.user?._id)
    const isPasswordValid = await user.isPasswordCorrect(oldPassword)
    if (!isPasswordValid) {
        throw new ApiError(401, "Old Password is incorrect")
    }
    user.password = newPassword
    await user.save({validateBeforeSave: false})
    return res.status(200).json(new ApiResponse(200, {}, "Password changed successfully"))
})


export {registerUser, loginUser, logoutUser, refreshAccessToken, changePassword}


