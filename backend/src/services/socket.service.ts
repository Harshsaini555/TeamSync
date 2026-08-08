import { socketServer } from "../config/socket";

export class SocketService {
  public emitToUser(userId: string, event: string, payload: any): void {
    try {
      const io = socketServer.getIO();
      io.to(`user:${userId}`).emit(event, payload);
    } catch (e) {
      console.warn(`⚠️ Socket emitToUser failed: ${e}`);
    }
  }

  public emitToProject(projectId: string, event: string, payload: any): void {
    try {
      const io = socketServer.getIO();
      io.to(`project:${projectId}`).emit(event, payload);
    } catch (e) {
      console.warn(`⚠️ Socket emitToProject failed: ${e}`);
    }
  }
}

export const socketService = new SocketService();
