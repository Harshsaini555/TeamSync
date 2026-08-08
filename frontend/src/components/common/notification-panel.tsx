"use client";

import React, { useState, useRef, useEffect } from "react";
import { useNotifications } from "@/hooks/use-notifications";
import { NotificationType } from "@/types/notification";
import { Bell, Check, UserCheck, MessageSquare, AtSign, CheckSquare, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export const NotificationPanel: React.FC = () => {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.TASK_ASSIGNED:
        return <UserCheck className="h-4 w-4 text-blue-400" />;
      case NotificationType.COMMENT_ADDED:
        return <MessageSquare className="h-4 w-4 text-purple-400" />;
      case NotificationType.USER_MENTIONED:
        return <AtSign className="h-4 w-4 text-amber-400" />;
      default:
        return <CheckSquare className="h-4 w-4 text-emerald-400" />;
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus:outline-none"
        title="Notifications"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-600 text-[9px] font-bold text-white shadow-sm animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 z-50 rounded-xl border border-slate-800 bg-[#161b26] p-0 shadow-2xl overflow-hidden">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-900/60">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-100">Notifications</span>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-rose-500/10 text-rose-400 border border-rose-500/20 px-1.5 py-0.2 rounded font-mono font-medium">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsRead()}
                className="text-[11px] text-blue-400 hover:text-blue-300 font-medium flex items-center space-x-1 transition-colors"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* Panel Body */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/50 custom-scrollbar">
            {isLoading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 italic">No notifications</div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n._id}
                  className={cn(
                    "p-3.5 flex items-start space-x-3 transition-colors text-xs",
                    n.isRead ? "bg-transparent opacity-75" : "bg-blue-950/20 border-l-2 border-l-blue-500"
                  )}
                >
                  <div className="mt-0.5 shrink-0">{getIcon(n.type)}</div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200 truncate">{n.title}</span>
                      <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                        {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-slate-400 leading-snug line-clamp-2">{n.message}</p>

                    {!n.isRead && (
                      <button
                        type="button"
                        onClick={() => markAsRead(n._id)}
                        className="text-[10px] text-blue-400 hover:text-blue-300 font-medium pt-1 inline-flex items-center"
                      >
                        <Check className="h-3 w-3 mr-1" /> Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
