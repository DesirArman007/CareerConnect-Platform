import { asyncHandler } from "../utils/asyncHandler";
import ApiError from "../utils/ApiError";
import ApiResponse from "../utils/ApiResponse";
import { Feedback } from "../models/feedbackModel";

const createFeedback = asyncHandler(async(req, res) =>{

    if(!req.body || Object.keys(req.body).length ===0){
        throw new ApiError(400, "Feedback data is required");
    }

    const feedback = await Feedback.create(req.body);

    return res.status(201).json(
        new ApiResponse(201,{
            success: true,
            message:"Feedback submitted",
            feedback: feedback
            })
    );

});

const getAllFeedback = asyncHandler(async(req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page -1) * limit;

    const total = await Feedback.countDocuments();

    const feedbackData = await Feedback.find()
        .sort({createdAy: -1})
        .skip(skip)
        .limit(limit)
        .lean()

    return res.status(200).json(
        new ApiResponse(200, {
                success: true,
                pagination: {
                    total, page, limit,
                    totalPages : Math.ceil(total/limit)
                },
                feedbacks: feedbackData
        })
    );
});


const getFeedbackById = asyncHandler(async(req,res) => {
    const {feedbackId} = req.params;

    const feedback = await Feedback.findById(feedbackId);

    if(!feedback){
        throw new ApiError(404, "Feedback not found");
    }

    return res.status(200).json(
        new ApiResponse(200,{
            success: true,
            feedback: feedback
        })
    )
})


const deleteFeedback = asyncHandler(async(req, res) => {
    const {feedbackId} = req.params;

   const feedback =  await Feedback.findByIdAndDelete(feedbackId);

   if(!feedback){
     throw new ApiError(404, "Feedback not found");
   }

   return res.status(200).json(
        new ApiResponse(200,{
            success: true,
            message: "Feedback deleted Successfully"
        })
   )

})

export {createFeedback, getAllFeedback, getFeedbackById, deleteFeedback};