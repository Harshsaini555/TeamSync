import http from "http";
import app from "./app";
import { env } from "./config/env";
import { connectDatabase } from "./config/database";
import { redisService } from "./config/redis";
import { socketServer } from "./config/socket";

const server = http.createServer(app);

// Initialize Socket.IO server bound to HTTP server
socketServer.init(server);

const startServer = async () => {
  await connectDatabase();
  await redisService.connect();

  const PORT = parseInt(env.PORT, 10) || 5000;

  server.listen(PORT, () => {
    console.log(`🚀 TeamSync Backend Server running on port ${PORT} [${env.NODE_ENV}]`);
    console.log(`🔗 API Base: http://localhost:${PORT}/api/v1`);
    console.log(`🔌 Socket.IO Engine initialized & ready`);
  });
};

startServer();

process.on("unhandledRejection", (err: Error) => {
  console.error("🔥 Unhandled Promise Rejection:", err);
});
