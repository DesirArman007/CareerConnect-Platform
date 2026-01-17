import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/userModel.js";

const getUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password -refreshToken ");

    if(!user){
        throw new ApiError(404, "User not found");
    }
    console.log(req.body);

    return res.status(200).json({
        success: true,
        data: user,
    });
});

const updateUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { name, email } = req.body;

    const user = await User.findById(userId);

    if(!user){
        throw new ApiError(404, "User not found");
    }

    user.name = name || user.name;
    user.email = email || user.email;

    await user.save();

    return res.status(200).json({
        success: true,
        data: user
    });
});       

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    
    const user = await User.findByIdAndDelete(userId);

    if(!user){
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json({
        success: true,
        message: "User deleted successfully"
    });
});

const updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId).select("+password");

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const isMatch = await user.isPasswordCorrect(oldPassword);
    if(!isMatch){
        throw new ApiError(400, "Old password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
        success: true,
        message: "Password updated successfully"
    });
});

const searchUsers = asyncHandler(async (req, res) => {
    const { name, email } = req.body;
    const filter = {};

    if (name && email) {
        filter.$or = [
            { name: { $regex: name, $options: "i" } },
            { email: { $regex: email, $options: "i" } }
        ];
    } else if (name) {
        filter.name = { $regex: name, $options: "i" };
    } else if (email) {
        filter.email = { $regex: email, $options: "i" };
    } else {
        throw new ApiError(400, "Please provide a name or email to search");
    }

    const users = await User.find(filter).select("-password -refreshToken");

    return res.status(200).json({
        success: true,
        data: users
    });
});

const getAllUsers = asyncHandler(async (req, res) => {
    const users = await User.find().select("-password -refreshToken");

    return res.status(200).json({
        success: true,
        data: users
    });
});


export { getUser, updateUser, deleteUser, updatePassword, searchUsers, getAllUsers };