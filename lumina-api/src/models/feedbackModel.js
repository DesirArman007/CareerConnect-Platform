import mongoose, { Schema } from "mongoose";
import { searchExp, uiExp } from "../constants/feedbackEnums.js";

const feedbackSchema = new Schema(
  {
    firstName: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },

    lastName: {
      type: String,
      lowercase: true,
      trim: true,
      index: true
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },

    searchExperience: {
      type: String,
      enum: searchExp,
      required: true,
      index: true
    },

    clarityFeeling: {
      type: String,
      enum: uiExp,
      required: true,
      index: true
    },

    message: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

export const Feedback =  mongoose.model("Feedback", feedbackSchema);
