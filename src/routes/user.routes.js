import { Router } from "express";
import {
    loggoutUser,
    loginUser,
    refreshAccessToken,
    registerUser,
    changeCurrentPassword,
    updateUserAvatar,
    updateUserCoverImg,
    updateUserData,
    getCurrentUser,
    getUserChannelProfile,
    getWatchHistory
} from "../controllers/users.controller.js";
import { upload } from '../middlewares/multer.middleware.js';
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()

router.route("/register").post(
    upload.fields([
        { name: "avatar", maxCount: 1 },
        { name: "coverImage", maxCount: 1 }
    ])
    , registerUser);

router.route("/logout").post(verifyJWT, loggoutUser)

router.route("/login").post(loginUser)

router.route("/refresh-token").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT, changeCurrentPassword)

routes.route("/get-current-user").get(getCurrentUser)

router.route("/update-user").patch(verifyJWT, updateUserData)

router.route("/update-user-avatar").patch(verifyJWT, upload.single("avatar")
    , updateUserAvatar)

router.route("/update-user-cover").patch(verifyJWT, upload.single("coverImage"), updateUserCoverImg)

router.route("/channel/:username").get(verifyJWT,getUserChannelProfile)

router.route("/watch-history").get(verifyJWT,getWatchHistory)

export default router