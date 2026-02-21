import mongoose,{Schema} from "mongoose";
import {jobApplicationStatus} from "../constants/jobApplicationStatusEnums.js";

const jobApplicationSchema = new Schema({
    jobId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Job",
        required:true,
        index: true
    },

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        index:true
    },

    resumeUrl:{
        type:String,
        trim:true,
        lowercase:true,
        required: true,
        match: /^https?:\/\/.+/,
        index:true
    },

    status:{
        type:String,
        enum: Object.values(jobApplicationStatus),
        default:jobApplicationStatus.APPLIED,
        index:true
    },

    appliedAt:{
        type:Date,
        default:Date.now,
        index:true

    }
})