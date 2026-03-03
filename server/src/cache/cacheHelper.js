import { asyncHandler } from "../utils/asyncHandler.js";
import client from "./client.js";
import { logger } from "../config/logger.js";

const pendingRequests = new Map();

export const getOrSetCache = async (key, fetchFunction, ttl = process.env.REDIS_TTL) => {

    const cached = await client.get(key);
    if (cached) {
        logger.info({ key }, "Cache HIT");
        return JSON.parse(cached);
    }

    // 🔒 Deduplication layer
    if (pendingRequests.has(key)) {
        return pendingRequests.get(key);
    }

    const promise = (async () => {
        try {
            const data = await fetchFunction();
            await client.setex(key, ttl, JSON.stringify(data));
            logger.info({ key, ttl }, "Cache SET");
            return data;
        } finally {
            pendingRequests.delete(key);
        }
    })();

    pendingRequests.set(key, promise);
    return promise;
};



export const getFromCache = asyncHandler(async (key) => {
    if (!client) {
        return null;
    }

    const data = await client.get(key);

    if (!data) {
        return null;
    }

    logger.info({ key }, "Cache HIT");
    return JSON.parse(data);

})


/* 
    Set data in cache with TTL(Time To Live)
   { key -> cache key, data -> data to cache, ttl -> default (10min) }
*/
export const setInCache = asyncHandler(async (key, data, ttl = process.env.REDIS_TTL) => {
    if (!client) {
        return false;
    }

    await client.setex(key, ttl, JSON.stringify(data));
    logger.info({ key, ttl }, "Cache SET");
    return true;

})


export const deleteFromCache = asyncHandler(async (key) => {
    if (!client) {
        return false;
    }
    await client.del(key);
    logger.info({ key }, "Cache DELETED");

})


export const deleteCachePattern = asyncHandler(async (pattern) => {
    if (!client) {
        return false;
    }

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
        await client.del(...keys);
        logger.info({ pattern, count: keys.length }, "Cache DELETED by pattern");
    }
})


export const clearAllCache = asyncHandler(async () => {
    if (!client) {
        return false;
    }

    await client.flushall();
    logger.info("All cache cleared");

})