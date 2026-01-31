import { Router } from "express";
import { registerUser,loginUser,refreshTokenHandler,logoutUser, resetPassword, forgotPassword, changePassword, googleAuth } from "../controllers/authController.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getUser,updateUser,deleteUser,updatePassword, searchUsers, getAllUsers } from "../controllers/userController.js";
import {loginRateLimiter, registerRateLimiter, generalRateLimiter} from "../middleware/rateLimiter.middleware.js";


const router = Router()

router.route('/register').post( registerRateLimiter,registerUser)
router.route('/login').post(loginRateLimiter ,loginUser);
router.route("/refreshToken").post(refreshTokenHandler);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/changePassword').post(verifyJWT, changePassword);
router.route('/forgotPassword').post(generalRateLimiter, forgotPassword);
router.route('/resetPassword').post(generalRateLimiter, resetPassword);
router.route('/googleAuth').post(registerRateLimiter,googleAuth)

router.route('/getUser').get(verifyJWT, getUser);
router.route('/updateUser').put(verifyJWT, updateUser);
router.route('/deleteUser').delete(verifyJWT, deleteUser);
router.route('/updatePassword').put(verifyJWT, updatePassword);
router.route("/searchUser").get(verifyJWT, authorizeRoles("admin", "recruiter"),searchUsers)
router.route("/allUsers").get(verifyJWT,authorizeRoles("admin"), getAllUsers);

export default router