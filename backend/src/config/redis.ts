import Redis from "ioredis";
import { env } from "./env";

class RedisService {
  private client: Redis | null = null;
  public isConnected = false;

  constructor() {
    try {
      this.client = new Redis({
        host: env.REDIS_HOST,
        port: parseInt(env.REDIS_PORT, 10),
        password: env.REDIS_PASSWORD || undefined,
        lazyConnect: true,
        maxRetriesPerRequest: 1
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        console.log("✅ Redis Connected");
      });

      this.client.on("error", (err) => {
        this.isConnected = false;
        console.warn("⚠️ Redis warning (operating in fallback mode):", err.message);
      });
    } catch (e) {
      this.isConnected = false;
      console.warn("⚠️ Redis initialization skipped.");
    }
  }

  public async connect(): Promise<void> {
    if (this.client) {
      try {
        await this.client.connect();
      } catch (err) {
        console.warn("⚠️ Could not connect to Redis server. App will use memory fallback.");
      }
    }
  }

  public getClient(): Redis | null {
    return this.isConnected ? this.client : null;
  }
}

export const redisService = new RedisService();
