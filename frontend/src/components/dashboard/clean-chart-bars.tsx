import React from "react";
import { TaskDistribution, PriorityDistribution } from "@/types/dashboard";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart3, ShieldAlert } from "lucide-react";

interface CleanChartBarsProps {
  taskDistribution: TaskDistribution;
  priorityDistribution: PriorityDistribution;
}

export const CleanChartBars: React.FC<CleanChartBarsProps> = ({
  taskDistribution,
  priorityDistribution
}) => {
  const totalTasks = Object.values(taskDistribution).reduce((a, b) => a + b, 0);
  const totalPriorities = Object.values(priorityDistribution).reduce((a, b) => a + b, 0);

  const statusBars = [
    { label: "Backlog", count: taskDistribution.BACKLOG, color: "bg-slate-500" },
    { label: "To Do", count: taskDistribution.TODO, color: "bg-sky-500" },
    { label: "In Progress", count: taskDistribution.IN_PROGRESS, color: "bg-amber-500" },
    { label: "In Review", count: taskDistribution.IN_REVIEW, color: "bg-purple-500" },
    { label: "Done", count: taskDistribution.DONE, color: "bg-emerald-500" },
    { label: "Canceled", count: taskDistribution.CANCELED, color: "bg-rose-500" }
  ];

  const priorityBars = [
    { label: "Urgent", count: priorityDistribution.URGENT, color: "bg-rose-500" },
    { label: "High", count: priorityDistribution.HIGH, color: "bg-amber-500" },
    { label: "Medium", count: priorityDistribution.MEDIUM, color: "bg-sky-500" },
    { label: "Low", count: priorityDistribution.LOW, color: "bg-slate-500" }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Chart 1: Task Status Distribution */}
      <Card className="border-slate-800 bg-[#161b26] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-slate-200">Task Status Breakdown</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{totalTasks} Total Issues</span>
        </div>

        <div className="space-y-2.5">
          {statusBars.map((b) => {
            const pct = totalTasks > 0 ? Math.round((b.count / totalTasks) * 100) : 0;
            return (
              <div key={b.label} className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">{b.label}</span>
                  <span className="font-mono text-slate-400">
                    {b.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${b.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Chart 2: Priority Distribution */}
      <Card className="border-slate-800 bg-[#161b26] p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-amber-400" />
            <h3 className="text-xs font-semibold text-slate-200">Priority Distribution</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-500">{totalPriorities} Categorized</span>
        </div>

        <div className="space-y-3 pt-1">
          {priorityBars.map((b) => {
            const pct = totalPriorities > 0 ? Math.round((b.count / totalPriorities) * 100) : 0;
            return (
              <div key={b.label} className="space-y-1 text-xs">
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-300 font-medium">{b.label} Priority</span>
                  <span className="font-mono text-slate-400">
                    {b.count} ({pct}%)
                  </span>
                </div>
                <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${b.color}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
