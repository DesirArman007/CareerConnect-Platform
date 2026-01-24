import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"
import { Roles } from "../constants/roles.js";

const userSchema = new Schema(
    {
        name: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true
        },
        password: {
            type: String,
            required: function(){
                return this.authProvider ==='email';
            },
            select: false
        },

        avatar: {
            type: String,
            default: null
        },
        resetPasswordToken: String,

        resetPasswordExpiry: Date,

        refreshToken: {
            type: String
        },
        role: {
            type: String,
            enum: Object.values(Roles),
            default: Roles.USER
        },
        authProvider: {
            type: String,
            enum: ["email", "google", "linkedin"],
            default: "email"
        },
        googleId: {
            type: String,
            index: true,
            sparse: true
        },
        githubId: {
            type: String,
            index: true,
            sparse: true
        },
        linkedinId: {
            type: String,
            index: true,
            sparse: true
        }


    },
    {
        timestamps: true
    }
)

 // 1. No password → OAuth user → skip
// 2. Password exists but not changed → skip
 // 3. Hash only when needed
userSchema.pre("save", async function (next) {
    if (!this.password) return next();

    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});


userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            name: this.name,
            email: this.email,
            role: this.role
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema)