import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiRes.js"


const registerUser = asyncHandler(
    async (req, res, next) => {
        const { username, fullname, password, email } = req.body
        if ([username, fullname, password, email].some((field) => field?.trim() === "")) {
            throw new apiError(400, "Field Must Be Filled !")
        }


        const existingUsername = await User.findOne({ username })
        console.log("username: ", existingUsername)
        if (existingUsername) {
            throw new apiError(409, "Username Already Exist !!")
        }
        const existingEmail = await User.findOne({ email })
        console.log("Email", existingEmail)

        if (existingEmail) {
            throw new apiError(409, "Email Already Exist !!")
        }




        const avatarImage = req.files?.avatar[0]?.path;
        // const coverImage = req.files?.coverImage[0]?.path;

        if (!avatarImage) {
            throw new apiError(400, "Avatar File Is Required !")
        }
        const upload = await uploadOnCloudinary(avatarImage)
        console.log("url is  ", upload)
        console.log("avatar image data is :", upload)
        if (!upload) {
            throw new apiError(400, "Failed To upload Avatar")
        }

        let coverImage;
        let user;
        if (Array.isArray(req.files.coverImage)) {
            coverImage = req.files.coverImage[0].path;
            const uploadCover = await uploadOnCloudinary(coverImage)
            console.log("cover image data is :", coverImage)

            if (!uploadCover) {
                throw new apiError(400, "Failed To upload Cover Image !")
            }
            user = await User.create({
                fullname,
                email,
                password,
                username: username.toLowerCase(),
                avatar: upload.url,
                coverImage: uploadCover?.url || ""
            })
        }
        else {
            user = await User.create({
                fullname,
                email,
                password,
                username: username.toLowerCase(),
                avatar: upload.url,
                coverImage: ""
            })
        }


        const createdUser = await User.findById(user._id).select(
            "-password -refreshToken"
        )
        if (!createdUser) {
            throw new apiError(500, "Can't Register User ! Please Try Again Later !");
        }

        return res.status(200).json(
            new apiResponse(200, createdUser, "User Registered SuccessFully !")
        )

    }
)

export { registerUser }
