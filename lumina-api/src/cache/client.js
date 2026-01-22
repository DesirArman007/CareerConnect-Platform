import {Redis} from "ioredis";

const redisUrl = process.env.REDIS_URL;

const client = new Redis(redisUrl);

client.on("connect",() => console.info("Cache is connecting"));
client.on("ready",() => console.info("Cache is ready"));
client.on("end",() => console.info("Cache is disconnected"));
client.on("reconnecting",() => console.info("Cache is reconnecting"));
client.on('error', err => console.log('Redis Client Error', err));


export default client;