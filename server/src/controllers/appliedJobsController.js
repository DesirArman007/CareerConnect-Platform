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

    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
        throw new ApiError(404, "Job not found");
    }

    try {
        const application = await AppliedJobs.create({
            userId,
            jobId,
            status: "applied"
        });

        return res.status(201).json(
            new ApiResponse(201, application, "Job applied successfully")
        );
    } catch (error) {
        if (error.code === 11000) {
            throw new ApiError(409, "You have already applied for this job");
        }
        throw new ApiError(500, "Failed to apply for job");
    }
});


const getAppliedJobs = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const applied = await AppliedJobs.find({ userId })
        .select("jobId status createdAt")
        .sort({ createdAt: -1 })
        .lean();

    if (!applied.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "No applied jobs found")
        );
    }

    const jobIds = applied.map(a => a.jobId);

    const jobs = await Job.find({ _id: { $in: jobIds } })
        .select("_id title company location salary apply_type apply_url")
        .lean();

    const jobsMap = new Map(
        jobs.map(job => [job._id.toString(), job])
    );

    const enriched = applied.map(a => ({
        ...a,
        job: jobsMap.get(a.jobId.toString()) || null
    }));

    return res.status(200).json(
        new ApiResponse(200, enriched, "Applied jobs fetched successfully")
    );
});


export {
    applyJob,
    getAppliedJobs
};
