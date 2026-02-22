import mongoose from "mongoose";
import { EMPLOYMENT_TYPES } from "../constants/jobEnums.js"
import { normalizeJSON } from "../plugins/normalizeJSON.plugin.js";

const jobSchema = new mongoose.Schema(
    {
        jobId: {
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
            trim: true,
            index: true
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
        employment_type: {
            type: String,
            enum: Object.values(EMPLOYMENT_TYPES),
            index: true
        },
        department: {
            type: String,
            trim: true
        },
        apply_type: {
            type: String,
            enum: ["INTERNAL", "EXTERNAL"],
            default: "INTERNAL",
            index: true
        },

        apply_url: {
            type: String,
            required: function () {
                return this.apply_type === "EXTERNAL";
            },
            match: /^https?:\/\//
        },
        source: {
            type: String,
            default: "Unknown",
            index: true
        },
        experience: {
            type: String,
            trim: true,
            default: null
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
        joblive: {
            type: Boolean,
            default: true,
            index: true
        },
        closedAt: {
            type: Date,
            default: null
        },
        last_seen: {
            type: Date,
            default: null,
            index: true
        }
    },
    {
        timestamps: true,
        versionKey: false,
        collection: 'jobs'
    }
);

// INDEXES

jobSchema.index({ company: 1, jobId: 1 }, { unique: true });
jobSchema.index({ company: 1, location: 1 });
jobSchema.index({ joblive: 1, createdAt: -1 });
jobSchema.index({ closedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });
jobSchema.index({ company: 1, joblive: 1, last_seen: 1 })
jobSchema.index({ title: "text", description: "text" });

jobSchema.plugin(normalizeJSON);

const jobsDB = mongoose.connection.useDb("job_aggregator");

export const Job =
  jobsDB.models.Job || jobsDB.model("Job", jobSchema);