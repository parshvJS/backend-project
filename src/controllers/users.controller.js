import { asyncHandler } from "../utils/asyncHandler.js";
import { apiError } from "../utils/apiError.js"
import { User } from "../models/user.models.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { apiResponse } from "../utils/apiRes.js"
import jwt from "jsonwebtoken"
import mongoose from "mongoose";


const generateAccessAndRefreshtokens = async (userId) => {
    try {
        const user = await User.findById(userId)
        const refreshToken = user.generateRefreshToken()
        const accessToken = user.generateAccessToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }



    } catch (error) {
        throw new apiError(500, error.message)
    }
}

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


const loginUser = asyncHandler(async (req, res) => {
    // take data from user to login account
    //make db call and check if there it any user name or email matching to it
    // if username matches then check if password for that user is matching or not
    // then give access to all details about that user in DB
    // if username not matches then throw error 

    const { email, username, password } = req.body

    if (!email && !username) {
        throw new apiError(404, "Please Enter Username Or Email !")
    }

    const user = await User.findOne({
        $or: [{ username }, { password }]
    })

    if (!user) {
        throw new apiError(404, "Username or Email Doesn't Exist !")
    }

    const passwordCheck = await user.isPasswordCorrect(password)
    if (!passwordCheck) {
        throw new apiError(401, "Password Not Matched !")
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshtokens(user._id)

    const loggedInUser = await User.findById(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new apiResponse(200, {
                user: {
                    loggedInUser,
                },
                tokens: {
                    "accessToken": accessToken,
                    "refreshToken": refreshToken
                }
            },
                " You Are Logged In Successfully ! "
            ))

})


const loggoutUser = asyncHandler(
    async (req, res) => {

        await User.findByIdAndUpdate(
            req.user._id,
            {
                $unset: {
                    refreshToken: 1
                }
            },
            {
                new: true
            }
        )

        const options = {
            httpOnly: true,
            secure: true
        }

        return res.status(200)
            .clearCookie("accessToken", options)
            .clearCookie("refreshToken", options)
            .json(new apiResponse(200, {}, "You Are Logged Out Successfully !"));


    }
)

const refreshAccessToken = asyncHandler(
    async (req, res) => {
        try {
            const userRefreshToken = req.cookies?.refreshToken || req.body?.refreshToken

            if (!userRefreshToken) throw new apiError(404, "Unauthorized Refresh Token !")

            const decodedToken = jwt.verify(userRefreshToken, process.env.REFRESH_TOKEN_SECRET)

            if (!decodedToken) throw new apiError(500, " Refresh Token invalid !")


            const userdata = await User.findById(req.user._id)
            if (decodedToken !== userdata.refreshToken) {
                throw new apiError(404, "Token MisMatched !")
            }
            if (decodedToken == userdata.refreshToken) {
                const { newaccessToken, newrefreshToken } = generateAccessAndRefreshtokens(req.user._id)
                return res.status(200)
                    .cookie("accessToken", newaccessToken)
                    .cookie("refreshToken", newrefreshToken)
                    .json(
                        new apiResponse(200, {
                            user: userdata,
                            tokens: {
                                "accessToken": newaccessToken,
                                "refreshToken": newrefreshToken
                            }
                        })
                    )
            }

        } catch (error) {
            throw new apiError(404, "Token Invalid Or Expired !")
        }

    }
)

const changeCurrentPassword = asyncHandler(
    async (req, res) => {
        const { oldPassword, newPassword } = req.body;
        const user = await User.findById(req.user?._id)

        const isOldPasswordValid = await user.isPasswordCorrect(oldPassword)
        if (!isOldPasswordValid) throw new apiError(400, "Not Valid Old Password !")

        user.password = newPassword
        await user.save({ validateBeforeSave: false })
        return res.
            status(200)
            .json(new apiResponse(200, {}, "Your Password changed successfully !"))
    }
)

const getCurrentUser = asyncHandler(
    async (req, res) => {
        return req.
            status(200)
            .json(new apiResponse(200, {
                "user": req.user
            }, "All Data Of User !"))
    }
)

const updateUserData = asyncHandler(
    async (req, res) => {
        const { newFullName, newEmail } = req.body;

        if (!newFullName && !newEmail) throw new apiError(400, "Please Provide full name or email !")
        const user = await User.findById(req.user?._id).select("-password")

        user.fullName = newFullName;
        user.email = newEmail;

        user.save({ validateBeforeSave: false })
        return res
            .status(200)
            .json(
                new apiResponse(200, {}, "Your Data Changed Successfully !")
            )

    }
)

const updateUserAvatar = asyncHandler(
    async (req, res) => {

        const avatarLocalImage = req.files.avatar[0].path;

        if (!avatarLocalImage) throw new apiError(400, "No file Available to update !")

        const avatarCloudinary = await uploadOnCloudinary(avatarLocalImage)

        if (!avatarCloudinary.url) throw new apiError(400, "No file Available to update in server !")

        const user = await User.findByIdAndUpdate(req.user._id, {
            $set: {
                avatar: avatarCloudinary?.url
            }
        }, {
            validateBeforeSave: false,
            new: true
        }).select("-password")

        return res
            .status(200)
            .json(new apiResponse(200, { "user": user }, "Your Avatar Changed successfully !"));
    }
)

const updateUserCoverImg = asyncHandler(
    async (req, res) => {

        const coverImage = req.file?.path;

        if (!coverImage) throw new apiError(400, "No file Available to update !")

        const coverCloudinary = await uploadOnCloudinary(coverImage)

        if (!coverCloudinary.url) throw new apiError(400, "No file Available to update in server !")

        const user = await User.findById(req.user?.avatar).select("-password")

        user.coverImage = coverCloudinary.url;
        user.save({ validateBeforeSave: false })

        return res
            .status(200)
            .json(new apiResponse(200, {}, "Your cover image Changed successfully !"));
    }
)

const getUserChannelProfile = asyncHandler(
    async (req, res) => {
        const { username } = req.params

        if (!username?.trim()) throw new apiResponse(400, "Username not found !");

        const channel = await User.aggregate([
            {
                $match: {
                    username: username?.toLowerCase()
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "channel",
                    as: "subscribers"
                }
            },
            {
                $lookup: {
                    from: "subscriptions",
                    localField: "_id",
                    foreignField: "subscriber",
                    as: "subscribedTo"
                }
            },
            {
                $addFields: {
                    subscribersCount: {
                        $size: "$subscribers"
                    }
                }
            },
            {
                $addFields: {
                    subscribedTo: {
                        $size: "$subscribedTo"
                    }
                }
            },
            {
                $addFields: {
                    isSubscribed: {
                        $cond: {
                            if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    fullname: 1,
                    username: 1,
                    email: 1,
                    subscribedTo: 1,
                    isSubscribed: 1,
                    subscribersCount: 1,
                    avatar: 1,
                    coverImage: 1
                }
            }
        ])


        if (!channel?.length) throw new apiError(500, "channel Doesn't Exist !")

        console.log("Channel Pipeline (first) :", channel)

        return res
            .status(200)
            .json(new apiResponse(200, channel[0], "User channel Fetched Successfully !"))
    }
)


const getWatchHistory = asyncHandler(
    async (req, res) => {

        const user = await User.aggregate(
            {
                $match: new mongoose.Types.ObjectId(req.user?._id)
            },
            {
                $lookup: {
                    from: "videos",
                    localField: "watchHistory",
                    foreignField: "_id",
                    as: "watchHistory",
                    pipeline: [
                        {
                            $lookup: {
                                from: "users",
                                localField: "owner",
                                foreignField: "_id",
                                as: "owner",
                                pipeline: [
                                    {
                                        $project: {
                                            fullname: 1,
                                            username: 1,
                                            avatar: 1
                                        }
                                    },
                                    {
                                        $addFields: {
                                            owner: {
                                                $first: "$owner"
                                            }
                                        }
                                    }
                                ]

                            }
                        }
                    ]
                }
            }
        ) 

        return res
        .status(200)
        .json(
            new apiResponse(
                200,
                user[0].watchHistory,
                "Watch History fetched successfully !"
            )
        )
    }
)

export {
    registerUser,
    loginUser,
    loggoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateUserData,
    updateUserAvatar,
    updateUserCoverImg,
    getUserChannelProfile,
    getWatchHistory
}
