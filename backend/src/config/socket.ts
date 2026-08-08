import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import { verifyAccessToken } from "../utils/jwt";
import { env } from "./env";

export interface AuthenticatedSocket extends Socket {
  userId?: string;
}

class SocketServer {
  private io: SocketIOServer | null = null;

  public init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: [env.CLIENT_URL, "http://localhost:3000"],
        credentials: true
      }
    });

    // Authentication middleware for Socket connections
    this.io.use((socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(" ")[1];
        if (!token) {
          return next(new Error("Authentication required for Socket connection"));
        }
        const decoded = verifyAccessToken(token);
        socket.userId = decoded.userId;
        next();
      } catch (err) {
        next(new Error("Invalid JWT token for Socket connection"));
      }
    });

    this.io.on("connection", (socket: AuthenticatedSocket) => {
      if (socket.userId) {
        // Auto join personal room user:<userId>
        socket.join(`user:${socket.userId}`);
        console.log(`🔌 Socket connected: User ${socket.userId} (Socket ${socket.id})`);
      }

      socket.on("join-project", (projectId: string) => {
        socket.join(`project:${projectId}`);
        console.log(`🔌 Socket ${socket.id} joined room project:${projectId}`);
      });

      socket.on("leave-project", (projectId: string) => {
        socket.leave(`project:${projectId}`);
        console.log(`🔌 Socket ${socket.id} left room project:${projectId}`);
      });

      socket.on("disconnect", () => {
        console.log(`🔌 Socket disconnected: ${socket.id}`);
      });
    });

    return this.io;
  }

  public getIO(): SocketIOServer {
    if (!this.io) {
      throw new Error("Socket.IO server not initialized");
    }
    return this.io;
  }
}

export const socketServer = new SocketServer();
