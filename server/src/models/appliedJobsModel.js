import mongoose from "mongoose";
import { jobAppicationStatus } from "../constants/jobApplicationStatusEnums.js";
import { normalizeJSON } from "../plugins/normalizeJSON.plugin.js";


const appliedJobsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job",
        required: true
    },

    status: {
        type: String,
        enum: Object.values(jobAppicationStatus),
        default: jobAppicationStatus.APPLIED
    }
}, { timestamps: true });

appliedJobsSchema.index({ userId: 1, jobId: 1 }, { unique: true });
appliedJobsSchema.index({ userId: 1, createdAt: -1 });

appliedJobsSchema.plugin(normalizeJSON);

export const AppliedJobs = mongoose.model("AppliedJobs", appliedJobsSchema);
