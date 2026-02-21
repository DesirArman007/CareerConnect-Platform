import { asyncHandler } from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Feedback } from "../models/feedbackModel.js";

const createFeedback = asyncHandler(async(req, res) =>{

    if(!req.body || Object.keys(req.body).length ===0){
        throw new ApiError(400, "Feedback data is required");
    }

    const feedback = await Feedback.create(req.body);

    return res.status(201).json(
        new ApiResponse(201,
            "Feedback submitted",
             {feedback: feedback.toJSON()}
            )
    );

});

const getAllFeedback = asyncHandler(async(req, res) => {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page -1) * limit;

    const total = await Feedback.countDocuments();

    const feedbacks = await Feedback.find()
        .sort({createdAt: -1})
        .skip(skip)
        .limit(limit)
        

    return res.status(200).json(
        new ApiResponse(200, 
            "Feedback fetched successfully",{
                feedbacks:feedbacks.map(f => f.toJSON()),
                pagination: {
                    total, page, limit,
                    totalPages : Math.ceil(total/limit)
                }
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
        new ApiResponse(
            200,
            "Feedback fetched successfully",
            {feedback: feedback.toJSON()}
        )
    )
})


const deleteFeedback = asyncHandler(async(req, res) => {
    const {feedbackId} = req.params;

   const feedback =  await Feedback.findByIdAndDelete(feedbackId);

   if(!feedback){
     throw new ApiError(404, "Feedback not found");
   }

   return res.status(200).json(
        new ApiResponse(200,
             "Feedback deleted Successfully",
             null
        )
   )

})

export {
    createFeedback, 
    getAllFeedback, 
    getFeedbackById, 
    deleteFeedback
};