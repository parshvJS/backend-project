import { Router } from "express";
import { loggoutUser,
    loginUser,
    refreshAccessToken,
    registerUser,
    changeCurrentPassword,
    updateUserAvatar,
    updateUserCoverImg,
    updateUserData } from "../controllers/users.controller.js";
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

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/update-user").post(verifyJWT,updateUserData)

router.route("/update-user-avatar").post( upload.fields([{ name: "avatar", maxCount: 1}])
,verifyJWT,updateUserAvatar)

router.route("/update-user-cover").post( upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "coverImage", maxCount: 1 }
])
,verifyJWT,updateUserCoverImg)




export default router