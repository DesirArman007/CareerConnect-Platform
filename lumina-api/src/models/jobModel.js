import mongoose from "mongoose";
import { JOB_TYPES, EMPLOYMENT_TYPES } from "../constants/jobEnums.js"
import { jobConnection } from "../config/jobConnection.js";

const jobSchema = new mongoose.Schema(
    {
        // ... (Your existing fields: job_id, title, etc. remain unchanged) ...
        job_id: {
            type: String,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        company: {
            type: String,
            required: true,
            trim: true
        },
        location: {
            type: String,
            trim: true,
            index: true
        },
        description: {
            type: String,
            required: true
        },
        job_type: {
            type: String,
            enum: Object.values(JOB_TYPES),
            default: JOB_TYPES.JOB,
            index: true
        },
        employment_type: {
            type: String,
            enum: EMPLOYMENT_TYPES,
            index: true
        },
        department: {
            type: String,
            trim: true
        },
        apply_url: {
            type: String,
            required: true
        },
        source: {
            type: String,
            default: "Unknown",
            index: true
        },

        // --- NEW FIELDS START HERE ---

        // 1. Experience: Made optional so old data doesn't break
        experience: {
            type: String, // e.g., "2-5 years", "Senior", "Entry Level"
            trim: true,
            default: null // Explicitly setting default to null for clarity
        },
        experience_min_years: {
            type: Number,
            default: null,
            index: true
        },
        experience_max_years: {
            type: Number,
            default: null,
            index: true
        },

        // 2. JobLive: Boolean status flag
        joblive: {
            type: Boolean,
            default: true, // IMPORTANT: New jobs are active by default
            index: true    // You will likely filter by this (e.g., show only active jobs)
        },

        // --- NEW FIELDS END HERE ---

        last_seen: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'jobs'
    }
);

// INDEXES

jobSchema.index({ company: 1, job_id: 1 }, { unique: true });
jobSchema.index({ createdAt: -1 });
jobSchema.index({ company: 1, location: 1 });
jobSchema.index({ title: "text", description: "text" });

// NEW INDEX RECOMMENDATION: 
// If you plan to heavily query "Active jobs only", add this compound index:
jobSchema.index({ joblive: 1, createdAt: -1 });

const Job = jobConnection.model("Job", jobSchema);

export default Job;