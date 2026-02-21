import { Router } from "express";
import {
    saveJob,
    removeSavedJob,
    getSavedJobs
} from "../controllers/savedJobsController.js";

import {
    applyJob,
    getAppliedJobs
} from "../controllers/appliedJobsController.js";

import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";
import { Roles } from "../constants/roles.js";

const router = Router();

// Apply verification to all routes
router.use(verifyJWT);

router.post("/save-jobs/:jobId", saveJob);
router.delete("/remove-saved-jobs/:jobId", removeSavedJob);
router.get("/get-saved-jobs", getSavedJobs);


router.post("/apply-job/:jobId", applyJob);
router.get("/get-applied-jobs", getAppliedJobs);

export default router;