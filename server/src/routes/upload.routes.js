import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import cloudinary from "../services/cloudinary.js";

const router = Router();

router.post("/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(
        base64,
        {
            resource_type: "auto",
            folder: "careerconnect/uploads",
        }
    )

    res.json({ url: result.secure_url, public_id: result.public_id });

});

export default router;