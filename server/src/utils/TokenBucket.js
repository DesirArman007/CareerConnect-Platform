import { Redis } from "ioredis";


const redisUrl = process.env.REDIS_URL;
console.log(redisUrl);
const redis = new Redis(redisUrl);

export class TokenBucket {

    constructor(capacity, refillRate) {
        this.capacity = capacity,
            this.refillRate = refillRate
    }


    async isAllowed(clientId) {
        const keyCount = `rate_limit:${clientId}:count`;
        const keyLastRefill = `rate_limit:${clientId}:lastRefill`;
        const currentTime = Date.now();

        // Lua script ensures atomic read-modify-write
        const script = `
            local keyCount = KEYS[1]
            local keyLastRefill = KEYS[2]
            local capacity = tonumber(ARGV[1])
            local refillRate = tonumber(ARGV[2])
            local currentTime = tonumber(ARGV[3])
            
            local lastRefill = redis.call('GET', keyLastRefill)
            local count = redis.call('GET', keyCount)
            
            local lastRefillTime = lastRefill and tonumber(lastRefill) or currentTime
            local tokenCount = count and tonumber(count) or capacity
            
            local timePassedSecs = (currentTime - lastRefillTime) / 1000
            local tokensToAdd = math.floor(timePassedSecs * refillRate)
            tokenCount = math.min(capacity, tokenCount + tokensToAdd)
            
            if tokenCount > 0 then
            tokenCount = tokenCount - 1
            local newLastRefill = lastRefillTime + (tokensToAdd * 1000 / refillRate)
            redis.call('SET', keyCount, tokenCount, 'EX', 60)
            redis.call('SET', keyLastRefill, newLastRefill, 'EX', 60)
            return 1
            end
            return 0
        `;


        const result = await redis.eval(
            script,
            2,
            keyCount,
            keyLastRefill,
            this.capacity,
            this.refillRate,
            currentTime
        );


        return result === 1;
    }

}