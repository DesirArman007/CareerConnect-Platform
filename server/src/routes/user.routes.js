import { Router } from "express";
import { registerUser,loginUser,refreshTokenHandler,logoutUser, resetPassword, forgotPassword } from "../controllers/authController.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { getUser,updateUser,deleteUser,updatePassword, searchUsers, getAllUsers } from "../controllers/userController.js";


const router = Router()

router.route('/register').post(registerUser)
router.route('/login').post(loginUser);
router.route("/refreshToken").post(refreshTokenHandler);
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/forgotPassword').post(forgotPassword);
router.route('/resetPassword').post(resetPassword);

router.route('/getUser').get(verifyJWT, getUser);
router.route('/updateUser').put(verifyJWT, updateUser);
router.route('/deleteUser').delete(verifyJWT, deleteUser);
router.route('/updatePassword').put(verifyJWT, updatePassword);
router.route("/searchUser").get(verifyJWT,searchUsers)
router.route("/allUsers").get(verifyJWT,authorizeRoles("admin"), getAllUsers);


router.get('/admin', verifyJWT, authorizeRoles('admin'), (req, res) => {
    res.json({ message: "Welcome Admin" });
});

router.get('/recruiter', verifyJWT, authorizeRoles('recruiter','admin'), (req, res) => {
    res.json({ message: "Welcome Recruiter" });
});

router.get('/applicant', verifyJWT, authorizeRoles('applicant','recruiter','admin'), (req, res) => {
    res.json({ message: "Welcome Applicant" });
});
export default router