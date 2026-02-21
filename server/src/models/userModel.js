import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { Roles } from "../constants/roles.js";
import { statusEnums } from "../constants/statusEnums.js";
import { normalizeJSON } from "../plugins/normalizeJSON.plugin.js";

const userSchema = new Schema(
  {

    name: {
      type: String,
      required: true,
      trim: true,
      index: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true
    },
    avatar: {
      type: String,
      default: null
    },
    password: {
      type: String,
      required() {
        return this.authProvider === "email";
      },
      select: false
    },

    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.role === Roles.EMPLOYER;
      },
      default: null
    },

    role: {
      type: String,
      enum: Object.values(Roles),
      default: Roles.USER
    },
    authProvider: {
      type: String,
      enum: ["email", "google", "linkedin", "github"],
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
    },
    resetPasswordToken: {
      type: String,
      select: false
    },
    resetPasswordExpiry: Date,
    refreshToken: {
      type: String,
      select: false
    },
    appliedJobs: [
      {
        jobId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Job",
          index: true,
          required: true
        },
        appliedAt: {
          type: Date,
          default: Date.now
        }
      }
    ],
    status: {
      type: String,
      enum: Object.values(statusEnums),
      default: statusEnums.ACTIVE,
      index: true
    },
    lastActiveAt: {
      type: Date,
      default: null,
      index: true
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

// Indexes

userSchema.index({ email: 1, authProvider: 1 });

userSchema.plugin(normalizeJSON);

// Hooks 

userSchema.pre("save", async function (next) {
  try {
    if (!this.password) return next();
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (err) {
    next(err);
  }
});


userSchema.methods.isPasswordCorrect = function (password) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    { _id: this._id, role: this.role, companyId: this.companyId },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
};

export const User = mongoose.model("User", userSchema);
