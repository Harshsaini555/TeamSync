import Redis from "ioredis";
import { env } from "./env";

class RedisService {
  private client: Redis | null = null;
  public isConnected = false;

  constructor() {
    try {
      this.client = new Redis(env.REDIS_URL, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,

        retryStrategy(times) {
          if (times > 3) {
            return null;
          }

          return Math.min(times * 200, 1000);
        },
      });

      this.client.on("connect", () => {
        this.isConnected = true;
        console.log("✅ Redis Connected");
      });

      this.client.on("ready", () => {
        this.isConnected = true;
        console.log("✅ Redis Ready");
      });

      this.client.on("error", (err) => {
        this.isConnected = false;
        console.error("❌ Redis Error:", err.message);
      });

      this.client.on("close", () => {
        this.isConnected = false;
        console.log("⚠️ Redis connection closed");
      });
    } catch (err) {
      this.isConnected = false;
      console.warn("⚠️ Redis initialization failed.");
    }
  }

  public async connect(): Promise<void> {
    if (!this.client) return;

    try {
      await this.client.connect();
    } catch (err) {
      this.isConnected = false;
      console.warn(
        "⚠️ Redis unavailable. App operating with fallback storage."
      );
    }
  }

  public getClient(): Redis | null {
    return this.isConnected ? this.client : null;
  }
}

export const redisService = new RedisService();