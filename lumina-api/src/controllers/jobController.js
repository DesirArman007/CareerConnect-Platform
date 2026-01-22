import Job from "../models/jobModel.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getFromCache, setInCache, deleteFromCache } from "../cache/cacheHelper.js";
import { response } from "express";



// Fetch a single job posting by ID
const getJobById = asyncHandler(async (req, res) => {
  const { jobId } = req.params;

  const cacheKey = `job_detail:${jobId}`;
  try {
    const cached = await getFromCache(cacheKey);
    if (cached) return res.status(200).json(cached);
  } catch (err) {
    console.error("Cache retrieval failed, fetching from DB:", err);
  }


  const job = await Job.findById(jobId);

  if (!job) {
    console.log("Job does not exist with id:", jobId);
    throw new ApiError(404, "Job not found");
  }

  const response = new ApiResponse(200,
    {
      success: true,
      jobData: job,
    }
  );

  await setInCache(cacheKey, response, 1000);

  res.status(200).json(response);
})

// Fetch All Jobs (Paginated)
const getAllJobs = asyncHandler(async (req, res) => {

  const {
    page = 1,
    limit = 30,
    job_type,
    location,
    company,
    employment_type,
    department
  } = req.query;

  const cacheKey = `jobs:
    page=${page}:
    limit=${limit}:
    job_type=${job_type || "any"}:
    location=${location || "any"}:
    company=${company || "any"}:
    employment_type=${employment_type || "any"}:
    department=${department || "any"}`.replace(/\s+/g, "");

  const cached = await getFromCache(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }



  //  How many records to ignore before returning the reults
  /*   page = 1, limit = 10
       skip = (1 - 1) * 10 = 0 
       says -> Skip 0 jobs and Return jobs 1–10

       page = 2, limit = 10
       skip = (2 - 1) * 10 = 10 
       says -> Skip 10 jobs and Return jobs 11–20  */
  const skip = (page - 1) * limit;

  // filter object
  const filter = {};

  if (job_type) {
    filter.job_type = job_type;
  }

  if (location?.trim()) {
    // i is used for case insensitivity in Mongo
    filter.location = { $regex: location, $options: 'i' };
  }

  if (company?.trim()) {
    filter.company = { $regex: company, $options: 'i' };
  }

  if (employment_type) {
    filter.employment_type = employment_type
  }

  if (department) {
    filter.department = { $regex: department, $options: 'i' };
  }

  // Fetch jobs
  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 }) // newest job post first
    .limit(parseInt(limit))
    .skip(skip)
    .select('-__v'); // exclude version key

  const totalJobs = await Job.countDocuments(filter);

  const response = new ApiResponse(200, {
    jobs,
    pagination: {
      success: true,
      currentPage: Number(page),
      totalPages: Math.ceil(totalJobs / Number(limit)),
      totalJobs,
      limit: Number(limit)
    }
  });

  await setInCache(cacheKey, response, 300);

  res.status(200).json(response);
});


// Search Jobs by keyword, Title, Companies, Skills
const searchJobs = asyncHandler(async (req, res) => {

  const {
    keyword,
    page = 1,
    limit = 10,
    job_type,
    employment_type,
    department,
    location
  } = req.query;



  const cacheKey = `job_search:${keyword}:${page}:${limit}:${job_type}:${employment_type}:${department}:${location}`;

  try {
    const cached = await getFromCache(cacheKey);
    if (cached) return res.status(200).json(cached);
  } catch (err) {
    console.error("Cache retrieval failed, fetching from DB:", err);
  }

  if (!keyword?.trim()) {
    throw new ApiError(400, "Search term/keyword is required");
  }

  const skip = (page - 1) * limit;

  const searchFilter = {
    $or: [
      { title: { $regex: keyword, $options: 'i' } },
      { company: { $regex: keyword, $options: 'i' } },
      { skill: { $regex: keyword, $options: 'i' } },
      { location: { $regex: keyword, $options: 'i' } }
    ]
  };


  if (job_type) {
    searchFilter.job_type = job_type;
  }

  if (employment_type) {
    searchFilter.employment_type = employment_type;
  }

  if (department?.trim()) {
    searchFilter.department = { $regex: department, $options: 'i' };
  }

  if (location?.trim()) {
    searchFilter.location = { $regex: location, $options: 'i' };
  }

  const jobs = await Job.find(searchFilter)
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .select('-__v');

  const totalJobs = await Job.countDocuments(searchFilter);
  const response = new ApiResponse(200,

    {
      jobs,
      pagination: {
        success: true,
        currentPage: Number(page),
        totalPages: Math.ceil(totalJobs / Number(limit)),
        totalJobs: totalJobs,
        limit: Number(limit),
      },
      searchQuery: keyword
    });

  await setInCache(cacheKey, response, 300)

  res.status(200).json(response);


});


// Get jobs by Compnay
// All jobs from a specific company
const getJobsByCompany = asyncHandler(async (req, res) => {

  const { company } = req.params;

  const { page = 1, limit = 10 } = req.query;

  const cacheKey = `jobs_company:${company}:${page}:${limit}`;

  try {
    const cached = await getFromCache(cacheKey);
    if (cached) return res.status(200).json(cached);
  } catch (err) {
    console.error("Cache retrieval failed, fetching from DB:", err);
  }

  const skip = (page - 1) * limit;

  const jobs = await Job.find({
    company: { $regex: company, $options: 'i' }
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .select('-__v');


  const totalJobs = await Job.countDocuments({
    company: { $regex: company, $options: 'i' }
  });


  const response = new ApiResponse(200, {
    success: true,
    jobs,
    pagination: {
      currentPage: Number(page),
      totalPages: Math.ceil(totalJobs / Number(limit)),
      totalJobs: totalJobs,
      limit: Number(limit)
    }
  })

  await setInCache(cacheKey, response, 600);

  res.status(200).json(response);

});


// Fetch New Jobs
// Recently added 
const getNewJobs = asyncHandler(async (req, res) => {

  const {
    page = 1,
    limit = 10,
    days = 7
  } = req.query;

  const cacheKey = `new_jobs:${page}:${limit}:${days}`;

  try {
    const cached = await getFromCache(cacheKey);
    if (cached) return res.status(200).json(cached);
  } catch (err) {
    console.error("Cache retrieval failed, fetching from DB:", err);
  }


  const skip = (page - 1) * limit;

  // --------------------------------------------
  // Calculate date threshold for "new jobs"
  //
  // Example:
  //   Today = 20 Feb 2026
  //   days = 7
  //
  // Step 1: Create a Date object with today's date
  //   new Date() → 20 Feb 2026
  //
  // Step 2: Subtract `days` from today's date
  //   20 - 7 = 13
  //
  // Result:
  //   dateThreshold = 13 Feb 2026
  //
  // MongoDB condition:
  //   createdAt >= dateThreshold
  //
  // Meaning:
  //   "Fetch jobs created from 13 Feb 2026 up to today"
  //   → jobs added in the last 7 days
  //
  // No per-job calculation happens.
  // Only ONE cutoff date is calculated.
  const dateThreshold = new Date();
  dateThreshold.setDate(dateThreshold.getDate() - Number(days));

  const jobs = await Job.find({
    createdAt: { $gte: dateThreshold }
  })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(skip)
    .select('-__v');

  const totalJobs = await Job.countDocuments({
    createdAt: { $gte: dateThreshold }
  });

  const response = new ApiResponse(200, {
    jobs,
    pagination: {
      success: true,
      currentPage: Number(page),
      totalPages: Math.ceil(totalJobs / Number(limit)),
      totalJobs: totalJobs,
      limit: Number(limit)
    },
    message: `Jobs added in the last ${days}`
  }
  );

  await setInCache(cacheKey, response, process.env.REDIS_TTL)

  res.status(200).json(response);
})


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
        { job_type: originalJob.job_type },
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

            // Same job type (job / internship)
            {
              $cond: {
                if: { $eq: ["$job_type", originalJob.job_type] },
                then: 3,
                else: 0
              }
            },

            // Same employment type (full-time, part-time, etc.)
            {
              $cond: {
                if: { $eq: ["$employment_type", originalJob.employment_type] },
                then: 2,
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
        job_type: 1,
        employment_type: 1,
        apply_url: 1,
        createdAt: 1,
        similarityScore: 1
      }
    }
  ]);


  res.status(200).json(
    new ApiResponse(200, {
      similarJobs,
      count: similarJobs.length,
      originalJob: {
        id: originalJob._id,
        title: originalJob.title,
        company: originalJob.company
      },
      matchedKeywords: keywords
    })
  );
});


// Smart Search Suggestions(For Search Box)
const getSmartSeachSuggestions = asyncHandler(async (req, res) => {

  const { q, limit = 8 } = req.query;

  if (!q || q.length < 2) {
    return res.status(200).json(
      new ApiResponse(200, {
        success: true,
        data: {
          jobs: [],
          quickSuggestions: {
            titles: [],
            companies: [],
            locations: []
          }
        }
      })
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
    .select('title company location job_type employment_type createdAt')
    .sort({ createdAt: -1 });

  // Get unique values for quick suggestions(max 3 each)
  const [titleSuggestions, companySuggestions, locationSuggestions] = await Promise.all([
    Job.distinct('title', { title: { $regex: q, $options: 'i' } }).then(arr => arr.slice(0, 3)),
    Job.distinct('company', { company: { $regex: q, $options: 'i', } }).then(arr => arr.slice(0, 3)),
    Job.distinct('location', { location: { $regex: q, $options: 'i' } }).then(arr => arr.slice(0, 3))

  ]);

  res.status(200).json(
    new ApiResponse(200, {
      success: true,
      data: {
        jobs: jobs,
        quickSuggestions: {
          titles: titleSuggestions,
          companies: companySuggestions,
          locations: locationSuggestions
        }
      },
      query: q
    })
  );

});

const getFilterOptions = asyncHandler(async (req, res) => {

  const [departements, locations] = await Promise.all([
    Job.distinct('departement'),
    Job.distinct('location')
  ]);

  res.status(200).json(
    new ApiResponse(200, {
      departements: departements.filter(Boolean),
      locations: locations.filter(Boolean)

    })
  );
});

const getJobStats = asyncHandler(async (req, res) => {

  const cacheKey = 'job_stats';
  try {
    const cached = await getFromCache(cacheKey);
    if (cached) return res.status(200).json(cached);
  } catch (err) {
    console.error("Cache retrieval failed, fetching from DB:", err);
  }

  const [
    totalJobs,
    newJobsCount,
    jobsByType,
    jobsByLocation,
    recentJobs
  ] = await Promise.all([
    Job.countDocuments(),


    // Finds the job that are added in last 7 days
    Job.countDocuments({
      createdAt: {
        $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      }
    }),


    Job.aggregate([
      {
        $group: {
          _id: '$job_type',
          count: { $sum: 1 }
        }
      }
    ]),

    // Finds the  top 5 locations with most jobs
    Job.aggregate([
      {
        $group: {
          _id: '$location',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),


    // Gets the 5 monst recent jobs
    Job.find().sort({ createdAt: -1 }).limit(5).select('title company location job_type createdAt')

  ]);

  const jobTypeStats = jobsByType.reduce((acc, item) => {
    acc[item._id || 'other'] = item.count;
    return acc;
  }, {});

  const topLocations = jobsByLocation.map(loc => ({
    location: loc._id,
    count: loc.count
  }));


  const response = new ApiResponse(200, {
    totalJobs,
    newJobsThisWeek: newJobsCount,
    jobTypes: {
      jobs: jobTypeStats.job || 0,
      internships: jobTypeStats.internship || 0
    },
    topLocations,
    recentJobs
  });

  await setInCache(cacheKey, response, process.env.REDIS_TTL);

  res.status(200).json(response);

});

const getCompanies = asyncHandler(async (req, res) => {
  const cacheKey = "companies:list";

  const cached = await getFromCache(cacheKey);
  if (cached) return res.status(200).json(cached);

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

  const response = new ApiResponse(200, {
    companies: companies.map(c => ({
      name: c._id,
      jobs: c.jobCount
    }))
  });

  await setInCache(cacheKey, response, 600); // 10 min
  res.status(200).json(response);
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
  getCompanies
}