import mongoose from "mongoose";
import { JOB_TYPES, EMPLOYMENT_TYPES } from "../constants/jobEnums" 

const jobSchema = new mongoose.Schema(
  {
    
    job_id: { 
        type: String, 
        required: true,
    },

    title: { 
        type: String, 
        required: true, 
        trim: true,
        index: true // Standard index for fast regex search
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
        enum: Object.values(JOB_TYPES), // "job" or "internship"
        default: JOB_TYPES.JOB,
        index: true
    },

    employment_type: {
        type: String,
        enum: EMPLOYMENT_TYPES, // "Full-time", "Contract", etc.
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

    last_seen: { 
        type: Date, 
        default: Date.now 
    }
  },
  { 
    timestamps: true, 
    versionKey: false 
  }
);

// INDEXES (Performance & Safety)

// 1. The "Safety Lock" (From your old schema)
// Prevents the same job ID from the same company being saved twice.
jobSchema.index({ company: 1, job_id: 1 }, { unique: true });

// 2. The "Feeds" Index
// Makes "New Jobs" and "Latest" queries instant.
jobSchema.index({ createdAt: -1 });

// 3. The "Search" Index
// Optimizes filtering by company + location (very common user behavior).
jobSchema.index({ company: 1, location: 1 });

// 4. The "Keyword" Index (Keep text search available for future use)
jobSchema.index({ title: "text", description: "text" });


export default mongoose.model("Job", jobSchema);