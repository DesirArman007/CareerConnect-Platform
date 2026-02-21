import mongoose, { Schema } from "mongoose";
import { normalizeJSON } from "../plugins/normalizeJSON.plugin.js";

const companySchema = new Schema({

    companyName: {
        type: String,
        required: true,
        trim: true,
        index: true
    },

    website: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        match: /^https?:\/\/.+/,
        index: true
    },

    industry: {
        type: String,
        required: true,
        index: true
    },

    size: {
        type: String,
        enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
        required: true,
        index: true
    },

    location: {
        type: String,
        required: true,
        index: true
    },

    verified: {
        type: Boolean,
        default: false,
        index: true
    },

    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
},
    {
        timestamps: true
    });


companySchema.index({ name: 1, website: 1 }, { unique: true, collation: { locale: "en", strength: 2 } });
companySchema.plugin(normalizeJSON);

export const Company = mongoose.model("Company", companySchema);