const { default: ApiError } = require("../utils/ApiError");
const { asyncHandler } = require("../utils/asyncHandler")
const TokenBucket = require("../utils/TokenBucket")

const rateLimiter = asyncHandler( async(req, res, next) => {

    // using IP Address or user ID as the hey
    const clientId = req.ip || req.user?.id || "anonymous";

    const allowed = await TokenBucket.isAllowed(clientId);

    if(allowed){
        next();
    } else {
       throw new ApiError(429, "Too Many Requests. Please try again later.");
    }
});

module.exports = rateLimiter;