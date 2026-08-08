"use client";

import React from "react";
import { useTaskActivities } from "@/hooks/use-tasks";
import { Activity, Clock } from "lucide-react";

interface TaskActivitySectionProps {
  taskId: string;
}

export const TaskActivitySection: React.FC<TaskActivitySectionProps> = ({ taskId }) => {
  const { activities, isLoading } = useTaskActivities(taskId);

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-300">
        <Activity className="h-4 w-4 text-amber-400" />
        <span>Activity Log</span>
      </div>

      {isLoading ? (
        <div className="py-4 text-center text-xs text-slate-500">Loading activity history...</div>
      ) : activities.length === 0 ? (
        <div className="py-4 text-center text-xs text-slate-500 italic">No activity recorded.</div>
      ) : (
        <div className="relative border-l border-slate-800 ml-3 space-y-4 pl-4 py-1">
          {activities.map((activity) => (
            <div key={activity._id} className="relative text-xs space-y-0.5">
              <div className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-slate-800 border border-slate-600" />
              <div className="flex items-center space-x-1.5 text-slate-300">
                <span className="font-semibold text-slate-200">{activity.userId?.name || "System"}</span>
                <span className="text-slate-400">{activity.details}</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                {new Date(activity.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit"
                })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
