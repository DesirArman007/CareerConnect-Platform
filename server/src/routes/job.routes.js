import { Router } from "express";
import {
  getJobById,
  getAllJobs,
  searchJobs,
  getJobsByCompany,
  getNewJobs,
  getSimilarJobs,
  getSmartSeachSuggestions
} from "../controllers/jobController.js";

const router = Router();


// Static/Specific Routes 
router.get("/", getAllJobs);
router.get("/new/recent", getNewJobs);          
router.get("/search/query", searchJobs);       
router.get("/search/suggestions", getSmartSeachSuggestions); 

// Dynamic Routes with specific prefixes SECOND
router.get("/company/:company", getJobsByCompany);
router.get("/:jobId/similar", getSimilarJobs);    

// The "Catch-All" Dynamic Route LAST
router.get("/:jobId", getJobById);

export default router;