import { Router } from "express";
import { createFeedback,deleteFeedback,getAllFeedback,getFeedbackById } from "../controllers/feedbackController.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { authorizeRoles } from "../middleware/role.middleware.js";

const router = Router();

router.post("/create",createFeedback);

router.use(verifyJWT);
router.use(authorizeRoles("admin"));

router.get("/", getAllFeedback);
router.get("/:feedbackId", getFeedbackById);
router.delete("/:feedbackId",deleteFeedback);

export default router;