import { Job } from "../models/jobModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getFromCache, setInCache, deleteFromCache, getOrSetCache, deleteCachePattern } from "../cache/cacheHelper.js";
import { Roles } from "../constants/roles.js";
import { logger } from "../config/logger.js";


// creating a job
const createJob = asyncHandler(async (req, res) => {

  const { title, description, location, employment_type, department, experience_min_years, experience_max_years } = req.body;

  if ([title, description, location, employment_type, department].some((field) => !field || field.toString().trim() === "")) {
    throw new ApiError(400, "All fields are required");
  }

  if (
    experience_min_years < 0 ||
    experience_max_years < 0 ||
    experience_min_years > experience_max_years
  ) {
    throw new ApiError(400, "Invalid experience range");
  }

  // Get company name from user's companyId
  const { Company } = await import("../models/companyModel.js");
  const companyDoc = await Company.findById(req.user.companyId);

  if (!companyDoc) {
    throw new ApiError(400, "Company not found. Please complete your employer profile.");
  }

  // Generate unique jobId
  const jobId = `EMP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const job = await Job.create({
    jobId,
    title,
    description,
    location,
    employment_type,
    department,
    experience_min_years,
    experience_max_years,
    company: companyDoc.companyName,
    source: Roles.EMPLOYER,
    joblive: true,
    last_seen: new Date()
  });

  if (!job) {
    throw new ApiError(500, "Job not created");
  }

  const response = new ApiResponse(
    201,
    "Job Created successfully",
    {
      job: job.toJSON()
    }
  );

  await deleteCachePattern("jobs:*");
  await deleteCachePattern("new_jobs:*");
  await deleteFromCache("job_stats");
  await deleteFromCache("companies:list");

  res.status(201).json(response);

});


// Fetch a single job posting by ID
const getJobById = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const cacheKey = `job_detail:${jobId}`;
  try {
    const cached = await getFromCache(cacheKey);
    if (cached) return res.status(200).json(cached);
  } catch (err) {
    logger.error({ err }, "Cache retrieval failed, fetching from DB");
  }


  const job = await Job.findById(jobId);

  if (!job) {
    logger.warn({ jobId }, "Job does not exist");
    throw new ApiError(404, "Job not found");
  }

  const response = new ApiResponse(
    200,
    "Job fetched successfully",
    {
      job: job.toJSON()
    }
  );

  await setInCache(cacheKey, response, 1000);

  res.status(200).json(response);
});

// get all JOBS

const getAllJobs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 30,
    location,
    company,
    employment_type,
    department,
    experience_level
  } = req.query;

  const numPage = parseInt(page);
  const numLimit = parseInt(limit);
  const skip = (numPage - 1) * numLimit;

  const cacheKey = `jobs:page=${numPage}:limit=${numLimit}:location=${location || "any"}:company=${company || "any"}:employment_type=${employment_type || "any"}:department=${department || "any"}:experience_level=${experience_level || "any"}`;

  const data = await getOrSetCache(cacheKey, async () => {

    const filter = { joblive: true };

    if (location?.trim()) filter.location = { $regex: location, $options: "i" };
    if (company?.trim()) filter.company = { $regex: company, $options: "i" };
    if (employment_type) filter.employment_type = employment_type;
    if (department?.trim()) filter.department = { $regex: department, $options: "i" };

    if (experience_level) {
      const expLevels = {
        entry: { $lte: 2 },
        mid: { $gt: 2, $lte: 5 },
        senior: { $gt: 5 },
        director: { $gt: 8 }
      };

      if (expLevels[experience_level]) {
        filter.experience_min_years = expLevels[experience_level];
      }
    }

    const [jobs, totalJobs] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .limit(numLimit)
        .skip(skip)
        .select("-__v"),

      Job.countDocuments(filter)
    ]);

    const respone = new ApiResponse(
      200,
      "Jobs fetched successfully",
      {
        jobs: jobs.map(j => j.toJSON()),
        pagination: {
          currentPage: numPage,
          totalPages: Math.ceil(totalJobs / numLimit),
          totalJobs,
          limit: numLimit
        }
      }
    );

    return respone;

  });

  return res.status(200).json(data);
});


// Search Jobs by keyword, Title, Companies, Skills
const searchJobs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    employment_type,
    department,
    location,
    experience_level
  } = req.query;

  const keyword = req.query.keyword?.toString();

  if (!keyword) {
    throw new ApiError(400, "Search term/keyword is required");
  }

  const numPage = parseInt(page);
  const numLimit = parseInt(limit);
  const skip = (numPage - 1) * numLimit;

  const cacheKey = `job_search:${keyword}:${numPage}:${numLimit}:${employment_type || "any"}:${department || "any"}:${location || "any"}:${experience_level || "any"}`;

  const data = await getOrSetCache(cacheKey, async () => {

    const searchFilter = {
      joblive: true,
      $or: [{ title: { $regex: keyword, $options: 'i' } },
      { company: { $regex: keyword, $options: 'i' } },
      { skill: { $regex: keyword, $options: 'i' } },  // remove later if u dont add skill in job schema
      { location: { $regex: keyword, $options: 'i' } }]
    };

    if (employment_type) searchFilter.employment_type = employment_type;
    if (department?.trim()) searchFilter.department = { $regex: department, $options: 'i' };
    if (location?.trim()) searchFilter.location = { $regex: location, $options: 'i' };
    if (experience_level) {
      const expLevels = {
        entry: { $lte: 2 },
        mid: { $gt: 2, $lte: 5 },
        senior: { $gt: 5 },
        director: { $gt: 8 }
      };

      if (expLevels[experience_level]) {
        searchFilter.experience_min_years = expLevels[experience_level];
      }
    };

    const [jobs, totalJobs] = await Promise.all([
      Job.find(searchFilter)
        .sort({ createdAt: -1 })
        .limit(numLimit)
        .skip(skip)
        .select("-__v"),

      Job.countDocuments(searchFilter)
    ]);

    const response = new ApiResponse(
      200,
      "Search results fetched successfully",
      {
        jobs: jobs.map(j => j.toJSON()),
        pagination: {
          currentPage: numPage,
          totalPages: Math.ceil(totalJobs / numLimit),
          totalJobs,
          limit: numLimit
        },
        searchQuery: keyword
      }
    );

    return response;
  });

  return res.status(200).json(data);
});


// Get jobs by Compnay
// All jobs from a specific company
const getJobsByCompany = asyncHandler(async (req, res) => {

  const { company } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const numPage = parseInt(page);
  const numLimit = parseInt(limit);
  const skip = (numPage - 1) * numLimit;

  const cacheKey = `jobs_company:${company}:${numPage}:${numLimit}`;

  const data = await getOrSetCache(cacheKey, async () => {

    const filter = {
      company: { $regex: company, $options: 'i' },
      joblive: true
    };

    const [jobs, totalJobs] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .limit(numLimit)
        .skip(skip)
        .select("-__v"),

      Job.countDocuments(filter)
    ]);

    return new ApiResponse(
      200,
      "Company jobs fetched successfully",
      {
        jobs: jobs.map(j => j.toJSON()),
        pagination: {
          currentPage: numPage,
          totalPages: Math.ceil(totalJobs / numLimit),
          totalJobs,
          limit: numLimit
        }
      }
    );

  }, 600);

  return res.status(200).json(data);
});


// Fetch New Jobs
// Recently added 
const getNewJobs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    days = 7
  } = req.query;

  const numPage = parseInt(page);
  const numLimit = parseInt(limit);
  const numDays = parseInt(days);

  const skip = (numPage - 1) * numLimit;

  const cacheKey = `new_jobs:${numPage}:${numLimit}:${numDays}`;

  const data = await getOrSetCache(cacheKey, async () => {

    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - numDays);

    const filter = {
      createdAt: { $gte: dateThreshold },
      joblive: true
    };

    const [jobs, totalJobs] = await Promise.all([
      Job.find(filter)
        .sort({ createdAt: -1 })
        .limit(numLimit)
        .skip(skip)
        .select("-__v"),

      Job.countDocuments(filter)
    ]);

    // Fallback: if no recent jobs found, show the latest jobs regardless of date
    if (jobs.length === 0 && numPage === 1) {
      const fallbackFilter = { joblive: true };
      [jobs, totalJobs] = await Promise.all([
        Job.find(fallbackFilter)
          .sort({ createdAt: -1 })
          .limit(numLimit)
          .select("-__v"),
        Job.countDocuments(fallbackFilter)
      ]);
    }

    const respone = new ApiResponse(
      200,
      `Jobs added in the last ${numDays} days`,
      {
        jobs: jobs.map(j => j.toJSON()),
        pagination: {
          currentPage: numPage,
          totalPages: Math.ceil(totalJobs / numLimit),
          totalJobs,
          limit: numLimit
        }
      }
    );

    return respone;
  });

  return res.status(200).json(data);
});


// Get Similar Jobs (Rule-based Recommendations)

const getSimilarJobs = asyncHandler(async (req, res) => {
  const { jobId } = req.params;
  const { limit = 5 } = req.query;

  const originalJob = await Job.findById(jobId);
  if (!originalJob) {
    throw new ApiError(404, "Job not found");
  }

  const commonWords = [
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
    "for", "of", "with", "by", "as", "senior", "junior"
  ];

  let keywords = originalJob.title
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(word => word.length > 2 && !commonWords.includes(word));

  // Limit keywords to avoid heavy regex computation
  keywords = keywords.slice(0, 5);

  const initialMatchStage = {
    $match: {
      _id: { $ne: originalJob._id },
      $or: [
        { company: originalJob.company },
        { employment_type: originalJob.employment_type },
        ...(keywords.length > 0
          ? [{ title: { $regex: keywords.join("|"), $options: "i" } }]
          : [])
      ]
    }
  };


  const similarJobs = await Job.aggregate([
    initialMatchStage,

    {
      $addFields: {
        similarityScore: {
          $add: [
            // Same company → strong signal
            {
              $cond: {
                if: { $eq: ["$company", originalJob.company] },
                then: 10,
                else: 0
              }
            },

            // Same location
            {
              $cond: {
                if: { $eq: ["$location", originalJob.location] },
                then: 5,
                else: 0
              }
            },

            // Same employment type (full-time, part-time, etc.)
            {
              $cond: {
                if: { $eq: ["$employment_type", originalJob.employment_type] },
                then: 3,
                else: 0
              }
            },



            // Title keyword similarity
            ...keywords.map(keyword => ({
              $cond: {
                if: {
                  $regexMatch: {
                    input: { $toLower: "$title" },
                    regex: keyword
                  }
                },
                then: 4,
                else: 0
              }
            }))
          ]
        }
      }
    },

    // Only keep jobs that have some similarity
    {
      $match: {
        similarityScore: { $gt: 0 }
      }
    },

    // Best matches first
    {
      $sort: { similarityScore: -1, createdAt: -1 }
    },

    { $limit: Number(limit) },

    // Clean output
    {
      $project: {
        title: 1,
        company: 1,
        location: 1,
        employment_type: 1,
        apply_url: 1,
        createdAt: 1,
        similarityScore: 1
      }
    }
  ]);


  res.status(200).json(
    new ApiResponse(
      200,
      "Similar jobs fetched successfully",
      {
        similarJobs,
        count: similarJobs.length,
        originalJob: {
          id: originalJob._id,
          title: originalJob.title,
          company: originalJob.company
        },
        matchedKeywords: keywords
      }
    )
  );

});


// Smart Search Suggestions(For Search Box)
const getSmartSeachSuggestions = asyncHandler(async (req, res) => {

  const { q, limit = 8 } = req.query;

  if (!q || q.length < 2) {
    return res.status(200).json(
      new ApiResponse(
        200,
        "Search suggestions fetched successfully",
        {
          jobs: [],
          quickSuggestions: {
            titles: [],
            companies: [],
            locations: []
          }
        }
      )
    );
  }


  const filter = {
    $or: [
      { title: { $regex: q, $options: 'i' } },
      { company: { $regex: q, $options: 'i' } },
      { location: { $regex: q, $options: 'i' } },
      { description: { $regex: q, $options: 'i' } }
    ]
  };


  const jobs = await Job.find(filter)
    .limit(parseInt(limit))
    .select('title company location employment_type createdAt')
    .sort({ createdAt: -1 });

  // Get unique values for quick suggestions(max 3 each)
  const [titleSuggestions, companySuggestions, locationSuggestions] = await Promise.all([
    Job.distinct('title', { title: { $regex: q, $options: 'i' } }).then(arr => arr.slice(0, 3)),
    Job.distinct('company', { company: { $regex: q, $options: 'i', } }).then(arr => arr.slice(0, 3)),
    Job.distinct('location', { location: { $regex: q, $options: 'i' } }).then(arr => arr.slice(0, 3))

  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      "Search suggestions fetched successfully",
      {
        jobs: jobs.map(j => j.toJSON()),
        quickSuggestions: {
          titles: titleSuggestions,
          companies: companySuggestions,
          locations: locationSuggestions
        },
        query: q
      })
  );

});

const getFilterOptions = asyncHandler(async (req, res) => {

  const [departements, locations] = await Promise.all([
    Job.distinct('department'),
    Job.distinct('location')
  ]);

  res.status(200).json(
    new ApiResponse(200,
      "Filter options fetched successfully",
      {
        departements: departements.filter(Boolean),
        locations: locations.filter(Boolean)

      })
  );
});


const getJobStats = asyncHandler(async (req, res) => {

  const cacheKey = 'job_stats';

  const data = await getOrSetCache(cacheKey, async () => {

    const [
      totalJobs,
      newJobsCount,
      jobsByType,
      jobsByLocation,
      recentJobs
    ] = await Promise.all([
      Job.countDocuments({ joblive: true }),

      Job.countDocuments({
        createdAt: {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        joblive: true
      }),

      Job.aggregate([
        { $match: { joblive: true } },
        {
          $group: {
            _id: '$employment_type',
            count: { $sum: 1 }
          }
        }
      ]),

      Job.aggregate([
        { $match: { joblive: true } },
        {
          $group: {
            _id: '$location',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
      ]),

      Job.find({ joblive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('title company location employment_type createdAt')
    ]);

    const employmentTypeStats = jobsByType.reduce((acc, item) => {
      acc[item._id || 'other'] = item.count;
      return acc;
    }, {});

    const topLocations = jobsByLocation.map(loc => ({
      location: loc._id,
      count: loc.count
    }));

    return new ApiResponse(
      200,
      "Job statistics fetched successfully",
      {
        totalJobs,
        newJobsThisWeek: newJobsCount,
        employmentTypes: employmentTypeStats,
        topLocations,
        recentJobs: recentJobs.map(j => j.toJSON())
      }
    );
  });

  return res.status(200).json(data);
});

const getCompanies = asyncHandler(async (req, res) => {
  const cacheKey = "companies:list";

  const data = await getOrSetCache(cacheKey, async () => {

    const companies = await Job.aggregate([
      { $match: { company: { $exists: true, $ne: "" } } },
      {
        $group: {
          _id: "$company",
          jobCount: { $sum: 1 }
        }
      },
      { $sort: { jobCount: -1 } }
    ]);

    return new ApiResponse(
      200,
      "Companies fetched successfully",
      {
        companies: companies.map(c => ({
          name: c._id,
          jobs: c.jobCount
        }))
      }
    );

  }, 600); // 10 minutes TTL

  return res.status(200).json(data);
});

export {
  getJobById,
  getAllJobs,
  searchJobs,
  getJobsByCompany,
  getNewJobs,
  getSimilarJobs,
  getSmartSeachSuggestions,
  getFilterOptions,
  getJobStats,
  getCompanies,
  createJob
}