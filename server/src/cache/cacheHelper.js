import { asyncHandler } from "../utils/asyncHandler.js";
import client from "./client.js";


export const getFromCache = asyncHandler(async (key) => {
    if (!client) {
        return null;
    }

    const data = await client.get(key);

    if (!data) {
        return null;
    }

    console.log(`Cache HIT: ${key}`);
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
    console.log(`Cache SET: ${key} (TTL: ${ttl})`);
    return true;

})


export const deleteFromCache = asyncHandler(async (key) => {
    if (!client) {
        return false;
    }
    await client.del(key);
    console.log(`Cache DELETED: ${key}`);

})


export const deleteCachePattern = asyncHandler(async (pattern) => {
    if (!client) {
        return false;
    }

    const keys = await client.keys(pattern);
    if (keys.length > 0) {
        await client.del(...keys);
        console.log(`🗑️ Cache DELETED: ${keys.length} keys matching ${pattern}`);
    }
})


export const clearAllCache = asyncHandler(async () => {
    if (!client) {
        return false;
    }

    await client.flushall();
    console.log('All cache cleared');

})