import { Router } from "express";
import { loggoutUser, loginUser, refreshAccessToken, registerUser } from "../controllers/users.controller.js";
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
export default router