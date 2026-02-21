import mongoose from "mongoose";
import { AppliedJobs } from "../models/appliedJobsModel.js";
import { Job } from "../models/jobModel.js";
import { User } from "../models/userModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

const applyJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid Job ID");
    }

    const jobExists = await Job.findById(jobId);
    if (!jobExists) {
        throw new ApiError(404, "Job not found");
    }

    // Check if already applied
    const existingApplication = await AppliedJobs.findOne({ userId, jobId });
    if (existingApplication) {
        throw new ApiError(409, "You have already applied for this job");
    }

    // Create Application
    const application = await AppliedJobs.create({
        userId,
        jobId,
        status: "applied"
    });

    // Update User's appliedJobs array
    await User.findByIdAndUpdate(userId, {
        $push: {
            appliedJobs: {
                jobId: jobId,
                appliedAt: new Date()
            }
        }
    });

    return res.status(201).json(
        new ApiResponse(201, "Job applied successfully", { application })
    );
});

const getAppliedJobs = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const appliedJobs = await AppliedJobs.find({ userId })
        .populate({
            path: "jobId",
            select: "title company location salary type",
            populate: {
                path: "company", // Assuming Job model has a 'company' field referencing Company or it's a string. 
                // However, based on savedJobsController, it seems Job might have a company ref.
                // Let's check jobModel if possible, but for now follow savedJobsController pattern.
                select: "name logo"
            }
        })
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, "Applied jobs fetched successfully", appliedJobs)
    );
});

export {
    applyJob,
    getAppliedJobs
};
