import { TokenBucket } from "../utils/TokenBucket.js";
import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";


// 5 requests and 1 refills per sec
const loginBucket = new TokenBucket(5, 1);
// 3 requests and 1 refills per 10 sec
const registerBucket = new TokenBucket(3, 0.1);
// 10 requests and 2 refills per sec
const generalBucket = new TokenBucket(10, 2);


export const loginRateLimiter = asyncHandler( async( req, res, next) => {

    const clientId = req.ip || "anonymous";
    const allowed = await loginBucket.isAllowed(clientId);

    if(allowed){
        next();
    } else{
        throw new ApiError(429, "Too many login attempts. Please try again later.");
    }
});

export const registerRateLimiter = asyncHandler( async(req, res, next) => {

    const clientId = req.ip || "anonymous";
    const allowed = await registerBucket.isAllowed(clientId);

    if(allowed){
        next()
    } else{
        throw new ApiError(429, "Too many registration attempts. Please try again later.");
    }
});


export const generalRateLimiter = asyncHandler(async(req, res) => {
    const clientId = req.ip || req.user?.id || "anonymous";
    const allowed = await generalBucket.isAllowed(clientId);

    if(allowed){
        next();
    } else{
        throw new ApiError(429,"Too many requests. Please try again later.")
    }
});