import mongoose, {Schema} from "mongoose";


const JobSchema = new mongoose.Schema(
  {
    job_id: { 
        type: String, 
        required: true },

    company: { 
        type: String, 
        required: true, 
        index: true },

    title: { 
        type: String, 
        required: true, 
        index: true },

    description: { 
        type: String, 
        required: true },

    location: { 
        type: String, 
        index: true },

    department: String,

    employment_type: String,

    apply_url: String,

    source: { 
        type: String, 
        default: "Unknown" },

    scraped_at: { 
        type: Date, 
        required: true, index: true },

    first_seen: { 
        type: Date, default: Date.now },

    last_seen: { 
        type: Date, default: Date.now }
  },
  
  { versionKey: false }
);

JobSchema.index({ company: 1, job_id: 1 }, { unique: true });
JobSchema.index({ title: "text", description: "text" });

export default mongoose.model("Job", JobSchema);
