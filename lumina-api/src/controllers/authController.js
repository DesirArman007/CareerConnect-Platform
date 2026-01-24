import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { log } from "console";
import jwt from "jsonwebtoken";
import { Roles } from "../constants/roles.js";
import {OAuth2Client} from "google-auth-library";

const registerUser = asyncHandler(async (req, res) => {

    // 1. Get user details from request body
    const { name, email, password, role } = req.body;


    if ([name, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // 3. Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new ApiError(409, "User with this email already exists");
    }

    // 4. Create new user in the database
    // The password will be automatically hashed by the pre-save hook in your user.model.js
    const user = await User.create({
        name,
        email,
        password,
        role: role || Roles.USER,
        authProvider: 'email',
    });

    // 5. Retrieve the created user without the password field
    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
        throw new ApiError(500, "User already registered");
    }

    // 6. Send a success response
    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", createdUser)
    );
});

const loginUser = asyncHandler(async (req, res) => {
    // 1. Get email and password from request body
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    // 2. Find user by email
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }


    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        throw new ApiError(401, "Invalid user credentials");
    }

    // 4. Generate access and refresh tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // 5. Save refresh token to the database and remove password from output
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    const loggedInUser = await User.findById(user._id).select("-password");

    const options = {
        httpOnly: true,
        secure: true // Set to true in production
    }

    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                "User logged in successfully",
                { user: loggedInUser, accessToken, refreshToken }
            )
        );
});


const refreshTokenHandler = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        throw new ApiError(401, " No refresh token found")
    }

    let decodedToken;
    log(token);

    try {
        decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decodedToken?._id).select("+refreshToken");

    if (!user || user.refreshToken !== token) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const newRefreshToken = user.generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    const newAccessToken = user.generateAccessToken();

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .cookie("accessToken", newAccessToken, options)
        .cookie("refreshToken", newRefreshToken, options)
        .json(
            new ApiResponse(200, "Tokens refreshed successfully", {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken
            })
        );

})

const logoutUser = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
        const user = await User.findOne({ refreshToken });
        if (user) {
            user.refreshToken = null;
            await user.save({ validateBeforeSave: false });
        }
    }
    const options = {
        httpOnly: true,
        secure: true
    }

    res.clearCookie("accessToken", options);
    res.clearCookie("refreshToken", options);

    return res
        .status(200)
        .json(new ApiResponse(200, "User logged out successfully"))
});

const changePassword = asyncHandler(async (req, res) => {


    console.log("1. ROUTE HIT: changePassword function started.");
    console.log("2. REQ.USER:", req.user);
    console.log("3. USER ID TRYING TO SEARCH:", req.user?._id);
    console.log("4. ID TYPE:", typeof req.user?._id);
    const userId = req.user?._id;

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required")
    }

    const user = await User.findOne({ _id: userId }).select("+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }
    const isMatch = await user.isPasswordCorrect(oldPassword);
    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect")
    }

    user.password = newPassword;
    user.refreshToken = null;
    await user.save();

    return res.status(200).json(
        new ApiResponse(200, "Password changed successfully. Please login again")
    );
})

const forgotPassword = asyncHandler(async (req, res) => {

    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required")
    }

    const user = await User.findOne({ email });

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    if (!user) {
        // Send success response anyway to prevent email enumeration
        return res.status(200).json(
            new ApiResponse(200, "If an account exists, a password reset link has been sent")
        );
    }
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL || "http://localhost:8000"}/resetPassword?token=${resetToken}&id=${user._id}`;

    console.log(`Password reset URL (send this to user via email): ${resetURL}`);

    await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: `
            <p> Click on the link below to reset your password: </p>
            <a href="${resetURL}">Reset Password</a>
            `
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Password reset link has been sent to your email address")
        );
})


const resetPassword = asyncHandler(async (req, res) => {

    const { token, id } = req.query;
    const { newPassword } = req.body;

    if (user._id.toString() !== id) {
        throw new ApiError(400, "Invalid reset request");
    }

    if (!newPassword) {
        throw new ApiError(400, "New passwords is required");
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() }
    }).select("+password");

    if (!user) {
        throw new ApiError(400, "Invalid or expired password reset token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.refreshToken = null;

    await user.save();

    return res
        .status(200)
        .json(
            new ApiResponse(200, " Password has been reset successfully. Please login again")
        )

});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleAuth = asyncHandler(async(req, res) =>{
    const {idToken} = req.body;

    if(!idToken){
        throw new ApiError(400, "Google ID Token is required");
    }

    const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    
    if(!payload){
        throw new ApiError(401, "Invalid Google token");
    }

    const {sub:googleId, email, name, picture} = payload;

    if(!email){
        throw new ApiError(400, "Google account has no email");
    }

    let user = await User.findOne({
        $or:[ {googleId},{email}]
    });

    // user exits -> link to google if not linked
    if (user) {
        if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = "google";
        user.avatar = user.avatar || picture || null;
        await user.save();
        }
    }

    if(!user){
        user = await User.create({
            name,
            email,
            googleId,
            authProvider:"google",
            avatar: picture || null

        });
    }

    // Issue tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save();

    res.status(200).json(
        new ApiResponse(200,{
                user: {
                        id: user._id,
                        name: user.name,
                        email: user.email,
                        avatar: user.avatar,
                        role: user.role
                    },
                    accessToken,
                    refreshToken
        })
    )

})

export { registerUser, loginUser, logoutUser, refreshTokenHandler, changePassword, forgotPassword, resetPassword, googleAuth };