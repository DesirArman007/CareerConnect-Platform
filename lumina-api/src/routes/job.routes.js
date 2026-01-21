import { Router } from "express";
import {
  getJobById,
  getAllJobs,
  searchJobs,
  getJobsByCompany,
  getNewJobs,
  getSimilarJobs,
  getSmartSeachSuggestions,
  getFilterOptions,
  getJobStats
} from "../controllers/jobController.js";

const router = Router();


// Static/Specific Routes 
router.get("/stats", getJobStats);
router.get("/new/recent", getNewJobs);          
router.get("/search/query", searchJobs);       
router.get("/search/suggestions", getSmartSeachSuggestions); 
router.get("/filter-options",getFilterOptions);

// Dynamic Routes with specific prefixes SECOND
router.get("/company/:company", getJobsByCompany);
router.get("/:jobId/similar", getSimilarJobs);    

//  Dynamic Route 
router.get("/:jobId", getJobById);

router.get("/", getAllJobs);

export default router;