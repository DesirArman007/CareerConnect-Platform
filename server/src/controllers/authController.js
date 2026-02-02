import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";
import { Roles } from "../constants/roles.js";
import { OAuth2Client } from "google-auth-library";
import { statusEnums } from "../constants/statusEnums.js";
import { setAuthCookies, clearAuthCookies } from "../utils/authCookies.js";
import { hashToken } from "../utils/hashToken.js";

const registerUser = asyncHandler(async (req, res) => {

    // 1. Get user details from request body
    const { name, email, password } = req.body;


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
        role: Roles.USER,
        authProvider: 'email',
    });

    // 5. Retrieve the created user without the password field
    const createdUser = user.toJSON();

    if (!createdUser) {
        throw new ApiError(500, "User already registered");
    }

    console.log(`Setting auth cookies on POST /auth/register`);
    // 6. Send a success response
    return res.status(201).json(
        new ApiResponse(201, "User registered successfully", { user: createdUser })
    );
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new ApiError(400, "Email and password are required");
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
        throw new ApiError(404, "User does not exist");
    }

    if (user.status !== statusEnums.ACTIVE) {
        console.log(`Auth failure: Account not active for userId=${user._id} on POST /auth/login`);
        throw new ApiError(403, "Account is not active");
    }

    const isPasswordCorrect = await user.isPasswordCorrect(password);
    if (!isPasswordCorrect) {
        console.log(`Auth failure: Invalid credentials for userId=${user._id} on POST /auth/login`);
        throw new ApiError(401, "Invalid user credentials");
    }

    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = hashToken(refreshToken);

    user.lastLoginAt = new Date();
    user.lastActiveAt = new Date(); // Update last active

    await user.save({ validateBeforeSave: false });

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    console.log(`Setting auth cookies on POST /auth/login`);
    setAuthCookies(res, accessToken, refreshToken);

    console.log(`Auth success: userId=${user._id} for POST /auth/login`);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                "User logged in successfully",
                { user: loggedInUser }
            )
        );
});


const refreshTokenHandler = asyncHandler(async (req, res) => {
    const token = req.cookies?.refreshToken;
    if (!token) {
        throw new ApiError(401, " No refresh token found")
    }

    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ApiError(401, "Invalid refresh token");
    }

    const user = await User.findById(decodedToken?._id).select("+refreshToken");

    if (!user || !user.refreshToken) {
        throw new ApiError(401, "Invalid refresh token");
    }

    if (user.status !== statusEnums.ACTIVE) {
        throw new ApiError(403, "Account is not active");
    }

    // comparing token
    const storedToken = user.refreshToken;
    const incomingHash = hashToken(token);

    if (storedToken.length === 64) {
        if (storedToken !== incomingHash) {
            throw new ApiError(401, "Invalid refresh token");
        }
    } else {
        if (storedToken !== token) {
            throw new ApiError(401, "Invalid refresh token")
        }
    }

    // Rotating token
    const newRefreshToken = user.generateRefreshToken();
    const newAccessToken = user.generateAccessToken();

    user.refreshToken = hashToken(newRefreshToken);
    user.lastActiveAt = new Date();
    await user.save({ validateBeforeSave: false });

    console.log(`Setting auth cookies on POST /auth/refreshToken`);
    setAuthCookies(res, newAccessToken, newRefreshToken);
    console.log(`Auth success: userId=${user._id} for POST /auth/refreshToken`);

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Tokens refreshed successfully"));

});

const logoutUser = asyncHandler(async (req, res) => {

    const userId = req.user?._id;

    await User.updateOne({ _id: userId },
        { $set: { refreshToken: null } }
    )

    clearAuthCookies(res)

    return res
        .status(200)
        .json(new ApiResponse(200, "User logged out successfully"))
});

const changePassword = asyncHandler(async (req, res) => {

    const userId = req.user?._id;

    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new ApiError(400, "Old password and new password are required");
    }

    const user = await User.findOne({ _id: userId }).select("+password");
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (user.status !== statusEnums.ACTIVE) {
        throw new ApiError(403, "Account is not active");
    }

    const isMatch = await user.isPasswordCorrect(oldPassword);
    if (!isMatch) {
        throw new ApiError(400, "Current password is incorrect");
    }

    const isSamePassword = await user.isPasswordCorrect(newPassword);
    if (isSamePassword) {
        throw new ApiError(400, "New Password must be different from old Password");
    }

    user.password = newPassword;
    user.refreshToken = null;
    await user.save();

    clearAuthCookies(res);

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

    if (!user) {
        // Send success response anyway to prevent email enumeration
        await new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * 300) + 200));
        return res.status(200).json(
            new ApiResponse(200, "If an account exists, a password reset link has been sent")
        );
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");


    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetURL = `${process.env.FRONTEND_URL || "http://localhost:8000"}/resetPassword?token=${resetToken}&id=${user._id}`;

    if (process.env.NODE_ENV !== "production") {
        console.log("Password reset URL:", resetURL);
    }

    await sendEmail({
        to: user.email,
        subject: "Password Reset Request",
        html: `
            <p>You requested a password reset.</p>
            <p>This link will expire in 10 minutes.</p>
            <a href="${resetURL}">Reset Password</a>
            `
    });

    return res
        .status(200)
        .json(
            new ApiResponse(200, "Password reset link has been sent to your email address")
        );
});


const resetPassword = asyncHandler(async (req, res) => {

    const { token } = req.query;
    const { newPassword } = req.body;

    if (!token) {
        throw new ApiError(400, "Reset token is required");
    }

    if (!newPassword) {
        throw new ApiError(400, "New password is required");
    }

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: { $gt: Date.now() }
    }).select("+password");

    if (!user) {
        throw new ApiError(400, "Invalid or expired password reset token");
    }

    if (user.status !== statusEnums.ACTIVE) {
        throw new ApiError(403, "Account is not active");
    }

    const isSamePassword = await user.isPasswordCorrect(newPassword);
    if (isSamePassword) {
        throw new ApiError(400, "New password must be different from old password");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpiry = undefined;
    user.refreshToken = null;

    await user.save();

    clearAuthCookies(res);

    return res
        .status(200)
        .json(
            new ApiResponse(200, " Password has been reset successfully. Please login again")
        )

});

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const googleAuth = asyncHandler(async (req, res) => {
    const { idToken } = req.body;

    if (!idToken) {
        throw new ApiError(400, "Google ID Token is required");
    }

    let ticket;

    try {
        ticket = await client.verifyIdToken({
            idToken: idToken,
            audience: process.env.GOOGLE_CLIENT_ID
        });
    } catch (err) {
        throw new ApiError(401, "Invalid expired Google token");
    }

    const payload = ticket.getPayload();

    if (!payload) {
        throw new ApiError(401, "Invalid Google token");
    }

    const { sub: googleId, email, name, picture } = payload;

    if (!email) {
        throw new ApiError(400, "Google account has no email");
    }

    let user = await User.findOne({
        $or: [{ googleId }, { email }]
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

    if (!user) {
        user = await User.create({
            name,
            email,
            googleId,
            authProvider: "google",
            avatar: picture || null

        });
    }

    if (user.status !== statusEnums.ACTIVE) {
        throw new ApiError(403, "Account is not active");
    }

    // Issue tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = hashToken(refreshToken);
    user.lastActiveAt = new Date();
    user.lastLoginAt = new Date();

    await user.save({ validateBeforeSave: false });

    console.log(`Setting auth cookies on POST /auth/googleAuth`);
    setAuthCookies(res, accessToken, refreshToken);
    console.log(`Auth success: userId=${user._id} for POST /auth/googleAuth`);

    res.status(200)
        .json(
            new ApiResponse(
                200,
                "Google login successful", { user: user.toJSON() })
        )

})

export { registerUser, loginUser, logoutUser, refreshTokenHandler, changePassword, forgotPassword, resetPassword, googleAuth };