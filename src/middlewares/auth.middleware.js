import { apiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken"

//takes req cookies having access token and refresh token
// decode that token
// got object having user data
// found the user
//added user to req

export const verifyJWT = asyncHandler(
    async (req, res, next) => {
        const token =await req.cookies.accessToken || req.header("Authorization")?.replace("Bearer", "")

        if (!token) throw new apiError(400, "Unauthorized Request !")

        const decodedToken =jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        if (!decodedToken) throw new apiError(500, "No Data Found In Cookies !")

        const PreUser = await User.findById(decodedToken._id).select("-password -refreshToken")

        if (!PreUser) throw new apiError(500, "No Data Found In Database !")

        req.user = PreUser;

        next()
    }
)