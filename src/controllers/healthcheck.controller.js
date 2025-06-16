import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const healthCheck = asyncHandler(async (req, res) => {
    console.log("abc")
    return res.status(200).json(new ApiResponse(200, "Ok", "Health check passed"))
})
export {healthCheck}
    
