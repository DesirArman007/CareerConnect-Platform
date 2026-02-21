import mongoose from "mongoose";
import { Job } from "../models/jobModel.js";
import { Company } from "../models/companyModel.js";
import { User } from "../models/userModel.js";
import { SavedJobs } from "../models/savedJobsModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

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
                savedJob,
                "Job saved successfully"
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
                null,
                "Saved job removed successfully"
            )
        )
});

const getSavedJobs = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    // 1️⃣ Get saved job references from career_jacked DB
    const savedJobs = await SavedJobs.find({ userId })
        .select("jobId createdAt")
        .sort({ createdAt: -1 })
        .lean();


    if (!savedJobs.length) {
        return res.status(200).json(
            new ApiResponse(200, [], "No saved jobs found")
        );
    }

    // 2️⃣ Extract jobIds
    const jobIds = savedJobs.map(s => s.jobId);

    // 3️⃣ Fetch actual jobs from jobs_db (Job model uses jobConnection)
    const jobs = await Job.find({ _id: { $in: jobIds } })
        .select("_id title company location salary apply_type apply_url")
        .lean();

    // 4️⃣ Create lookup map for fast matching
    const jobsMap = new Map(
        jobs.map(job => [job._id.toString(), job])
    );

    // 5️⃣ Merge savedJobs with actual job data
    const enrichedSavedJobs = savedJobs.map(s => ({
        ...s,
        job: jobsMap.get(s.jobId.toString()) || null
    }));

    return res.status(200).json(
        new ApiResponse(
            200,
            "Saved jobs fetched successfully",
            enrichedSavedJobs
        )
    );
});




export {
    saveJob,
    removeSavedJob,
    getSavedJobs
}