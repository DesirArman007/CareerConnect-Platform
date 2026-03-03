import { Redis } from "ioredis";
import { logger } from "../config/logger.js";

const redisUrl = process.env.REDIS_URL;

const client = new Redis(redisUrl);

client.on("connect", () => logger.info("Cache is connecting"));
client.on("ready", () => logger.info("Cache is ready"));
client.on("end", () => logger.info("Cache is disconnected"));
client.on("reconnecting", () => logger.info("Cache is reconnecting"));
client.on('error', err => logger.error({ err }, 'Redis Client Error'));


export default client;