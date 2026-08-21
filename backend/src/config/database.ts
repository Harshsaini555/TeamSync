import mongoose from "mongoose";
import { env } from "./env";

export const connectDatabase = async (): Promise<void> => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host} / ${conn.connection.name}`);
  } catch (error: any) {
    console.warn(`⚠️ MongoDB Connection Warning: Unable to connect to ${env.MONGODB_URI}`);
    console.warn(`👉 Please ensure MongoDB service is running locally on port 27017 or update MONGODB_URI in backend/.env`);
  }
};
