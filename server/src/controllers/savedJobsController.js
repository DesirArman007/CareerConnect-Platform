import mongoose from "mongoose";
import { Job } from "../models/jobModel.js";
import { Company } from "../models/companyModel.js";
import { User } from "../models/userModel.js";
import { SavedJobs } from "../models/savedJobsModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { logger } from "../config/logger.js";

const saveJob = asyncHandler(async (req, res) => {
    const { jobId } = req.params;
    const userId = req.user._id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid Job ID");
    }

    const jobExists = await Job.exists({ _id: jobId });
    if (!jobExists) {
        throw new ApiError(404, "Job not found");
    }

    let savedJob;

    try {
        savedJob = await SavedJobs.create({
            userId,
            jobId
        });
    }
    catch (error) {

        if (error.code === 11000) {
            throw new ApiError(409, "Job already saved");
        }

        throw new ApiError(500, "Failed to save job");
    }

    return res.status(201)
        .json(
            new ApiResponse(201,
                "Job saved successfully",
                savedJob
            )
        );
});

const removeSavedJob = asyncHandler(async (req, res) => {

    const { jobId } = req.params;
    const userId = req.user._id;

    if (!jobId || !mongoose.Types.ObjectId.isValid(jobId)) {
        throw new ApiError(400, "Invalid job ID");
    }

    const deletedJob = await SavedJobs.findOneAndDelete({
        userId,
        jobId
    });

    if (!deletedJob) {
        throw new ApiError(404, "Saved job not found");
    }

    return res.status(200)
        .json(
            new ApiResponse(200,
                "Saved job removed successfully",
                null
            )
        )
});

const getSavedJobs = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const savedJobs = await SavedJobs.find({ userId })
        .sort({ createdAt: -1 })
        .lean();

    logger.info({ userId, count: savedJobs.length }, "getSavedJobs");

    if (!savedJobs.length) {
        return res.status(200).json(
            new ApiResponse(200, "No saved jobs found", [])
        );
    }

    const jobIds = savedJobs.map(s => s.jobId);
    logger.info({ jobIds }, "getSavedJobs jobIds");

    const jobs = await Job.find({ _id: { $in: jobIds } })
        .select("title company location employment_type salary apply_type apply_url")
        .lean();

    logger.info({ matchedCount: jobs.length }, "getSavedJobs matched jobs");

    const jobsMap = new Map(
        jobs.map(job => [job._id.toString(), { ...job, id: job._id.toString(), _id: undefined }])
    );

    const response = savedJobs.map(s => ({
        savedId: s._id.toString(),
        savedAt: s.createdAt,
        job: jobsMap.get(s.jobId.toString()) || null
    }));

    return res.status(200).json(
        new ApiResponse(200, "Saved jobs fetched successfully", response)
    );
});

export {
    saveJob,
    removeSavedJob,
    getSavedJobs
}