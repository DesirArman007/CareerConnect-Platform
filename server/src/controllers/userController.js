import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/userModel.js";
import { clearAuthCookies } from "../utils/authCookies.js";

const getUser = asyncHandler(async (req, res) => {
    console.log(`Protected controller entered: GET /api/users/getUser`);
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password -refreshToken ");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "User fetched successfully", user.toJSON())
    );
});

const updateUser = asyncHandler(async (req, res) => {
    console.log(`Protected controller entered: PUT /api/users/updateUser`);
    const userId = req.user._id;
    const { name, email } = req.body;

    const user = await User.findById(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    if (!name && !email) {
        throw new ApiError(400, "Nothing to update");
    }


    if (name && name.length > 50) {
        throw new ApiError(400, "Name too long");
    }

    if (email && email.length > 100) {
        throw new ApiError(400, "Email is too long")
    }

    if (email) {
        const normalizedEmail = email.toLowerCase();

        if (normalizedEmail !== user.email) {
            const exist = await User.findOne({ email: normalizedEmail });
            if (exist) {
                throw new ApiError(409, "Email already in use");
            }

            user.email = normalizedEmail
        }
    }

    if (name) {
        user.name = name;
    }

    await user.save();

    return res.status(200).json(
        new ApiResponse(200, "User updated successfully", user.toJSON())
    );
});

const deleteUser = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const user = await User.findByIdAndDelete(userId);

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    return res.status(200).json(
        new ApiResponse(200, "User deleted successfully", null)
    );
});

const updatePassword = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    const user = await User.findById(userId).select("+password");

    if (!user) {
        throw new ApiError(404, "User not found");
    }

    const isMatch = await user.isPasswordCorrect(oldPassword);
    if (!isMatch) {
        throw new ApiError(400, "Old password is incorrect");
    }

    if (!newPassword || newPassword.length < 8) {
        throw new ApiError(400, "Password must be at lesat 8 characters");
    }

    const isSame = await user.isPasswordCorrect(newPassword);
    if (isSame) {
        throw new ApiError(400, "New password must be different");
    }

    user.password = newPassword;
    user.refreshToken = null;
    await user.save();

    clearAuthCookies(res);

    return res.status(200).json(
        new ApiResponse(200, " Password updated Successfully", null)
    );
});

const searchUsers = asyncHandler(async (req, res) => {
    const { name, email } = req.query;
    const filter = {};

    if (name && name.length > 50) {
        throw new ApiError(400, "Name too long");
    }


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

    return res.status(200).json(
        new ApiResponse(200,
            "Users fetched successfully",
            users.map(u => u.toJSON())
        )
    )
});

const getAllUsers = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const users = await User.find()
        .skip((page - 1) * limit)
        .limit(limit)
        .select("-password -refreshToken");

    return res.status(200).json(
        new ApiResponse(200,
            "Users fetched successfully",
            users.map(u => u.toJSON())
        )
    )
});


export { getUser, updateUser, deleteUser, updatePassword, searchUsers, getAllUsers };