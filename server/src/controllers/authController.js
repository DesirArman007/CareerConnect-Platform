import {asyncHandler} from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {User} from "../models/userModel.js";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { log } from "console";
import jwt from "jsonwebtoken";

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
        role,
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
    if(!token){
        throw new ApiError(401," No refresh token found")
    }

    let decodedToken;
    log(token);

    try{
        decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error){
        throw new ApiError(401,"Invalid refresh token");
    }

    const user = await User.findById(decodedToken?._id).select("+refreshToken");

    if(!user || user.refreshToken !== token){
        throw new ApiError(401,"Invalid refresh token");    
    }

    const newRefreshToken = user.generateRefreshToken();
    user.refreshToken = newRefreshToken;
    await user.save({validateBeforeSave: false});

    const newAccessToken = user.generateAccessToken();



res.json({ accessToken: newAccessToken });


})

const logoutUser = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    if(refreshToken){
        const user = await User.findOne({ refreshToken});
        if(user){
            user.refreshToken = null;
            await user.save({validateBeforeSave: false});
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
        .json( new ApiResponse(200, "User logged out successfully"))
});


const forgotPassword = asyncHandler(async(req,res) =>{

    const {email} = req.body;

    if(!email){
        throw new ApiError(400,"Email is required")
    }

    const user = await User.findOne({email});

    const resetToken  = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpiry = Date.now() + 10 *60 *60*1000;
    await user.save({validateBeforeSave:false});

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


const resetPassword = asyncHandler(async(req, res) =>{

    const {token, id} = req.query;
    const {newPassword} = req.body;

    if(!newPassword){
        throw new ApiError(400,"New passwords in required");
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest("hex");

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpiry: {$gt: Date.now()}
    }).select("+password");

    if(!user){
        throw new ApiError(400,"Invalid or expired password reset token");
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

export { registerUser,loginUser, logoutUser, refreshTokenHandler, changePassword, forgotPassword,resetPassword};