import mongoose from "mongoose";
import { normalizeJSON } from "../plugins/normalizeJSON.plugin.js";


const savedJobsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    }
}, { timestamps: true });

savedJobsSchema.index({ userId: 1, jobId: 1 }, { unique: true });

savedJobsSchema.plugin(normalizeJSON);

export const SavedJobs = mongoose.model("SavedJobs", savedJobsSchema);