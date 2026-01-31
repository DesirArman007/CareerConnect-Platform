import mongoose, { Schema } from "mongoose";
import { searchExp, uiExp } from "../constants/feedbackEnums.js";
import { normalizeJSON } from "../plugins/normalizeJSON.plugin.js";

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

    message: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);


feedbackSchema.plugin(normalizeJSON);

export const Feedback =  mongoose.model("Feedback", feedbackSchema);
