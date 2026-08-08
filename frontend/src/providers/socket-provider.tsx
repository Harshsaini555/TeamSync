"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { tokenManager } from "@/lib/token";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./auth-provider";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  joinProject: () => {},
  leaveProject: () => {}
});

const SOCKET_SERVER_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isAuthenticated) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    const token = tokenManager.getAccessToken();
    if (!token) return;

    const socketInstance = io(SOCKET_SERVER_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5
    });

    socketInstance.on("connect", () => {
      setIsConnected(true);
      console.log("🔌 Socket connected to server:", socketInstance.id);
    });

    socketInstance.on("disconnect", () => {
      setIsConnected(false);
      console.log("🔌 Socket disconnected");
    });

    // React Query Realtime Synchronization Handlers
    socketInstance.on("TASK_UPDATED", (payload: any) => {
      console.log("⚡ Realtime TASK_UPDATED received:", payload);
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      if (payload?._id) {
        queryClient.invalidateQueries({ queryKey: ["task", payload._id] });
      }
    });

    socketInstance.on("TASK_DELETED", () => {
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    });

    socketInstance.on("COMMENT_ADDED", (payload: any) => {
      if (payload?.taskId) {
        queryClient.invalidateQueries({ queryKey: ["task-comments", payload.taskId] });
        queryClient.invalidateQueries({ queryKey: ["task-activities", payload.taskId] });
      }
    });

    socketInstance.on("NOTIFICATION_RECEIVED", (notification: any) => {
      console.log("🔔 Realtime NOTIFICATION_RECEIVED:", notification);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unread-count"] });
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, queryClient]);

  const joinProject = useCallback(
    (projectId: string) => {
      if (socket && isConnected) {
        socket.emit("join-project", projectId);
      }
    },
    [socket, isConnected]
  );

  const leaveProject = useCallback(
    (projectId: string) => {
      if (socket && isConnected) {
        socket.emit("leave-project", projectId);
      }
    },
    [socket, isConnected]
  );

  return (
    <SocketContext.Provider value={{ socket, isConnected, joinProject, leaveProject }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  return useContext(SocketContext);
};
