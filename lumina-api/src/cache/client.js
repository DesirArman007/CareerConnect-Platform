import {Redis} from "ioredis";

const client = new Redis(process.env.REDIS_URL);


client.on("connect",() => console.info("Cache is connecting"));
client.on("ready",() => console.info("Cache is ready"));
client.on("end",() => console.info("Cache is disconnected"));
client.on("reconnecting",() => console.info("Cache is reconnecting"));
client.on('error', err => console.log('Redis Client Error', err));


export default client;