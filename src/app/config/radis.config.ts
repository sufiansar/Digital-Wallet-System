import { createClient } from "redis";
import { envConfig } from "./env";

export const redisClient = createClient({
  username: envConfig.REDIS.REDIS_USERNAME,
  password: envConfig.REDIS.REDIS_PASS,
  socket: {
    host: envConfig.REDIS.REDIS_HOST,
    port: envConfig.REDIS.REDIS_PORT,
  },
});

redisClient.on("error", (err: any) => console.log("Redis Client Error", err));

export const connectRedis = async () => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
    console.log("redisConnected");
  }
};
