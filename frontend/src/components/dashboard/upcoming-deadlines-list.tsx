import React from "react";
import { Task } from "@/types/task";
import { Card } from "@/components/ui/card";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components/common/status-badge";
import { PriorityBadge } from "@/components/common/priority-badge";

interface UpcomingDeadlinesListProps {
  tasks: Task[];
}

export const UpcomingDeadlinesList: React.FC<UpcomingDeadlinesListProps> = ({ tasks }) => {
  return (
    <Card className="border-slate-800 bg-[#161b26] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-rose-400" />
          <h3 className="text-xs font-semibold text-slate-200">Upcoming Deadlines (Next 7 Days)</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">{tasks.length} Pending</span>
      </div>

      <div className="space-y-2.5">
        {tasks.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 italic">
            No urgent upcoming deadlines in the next 7 days.
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task._id}
              className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
            >
              <div className="space-y-1 min-w-0 pr-2">
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-blue-400">{task.taskKey}</span>
                  <PriorityBadge priority={task.priority} />
                </div>
                <h4 className="font-semibold text-slate-100 truncate">{task.title}</h4>
              </div>

              <div className="flex flex-col items-end space-y-1 text-right shrink-0">
                <StatusBadge status={task.status} />
                {task.dueDate && (
                  <span className="text-[10px] text-amber-400 font-mono flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {new Date(task.dueDate).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
