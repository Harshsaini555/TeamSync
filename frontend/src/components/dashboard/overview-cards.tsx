import React from "react";
import { OverviewMetrics } from "@/types/dashboard";
import { Card } from "@/components/ui/card";
import { Folder, CheckSquare, CheckCircle2, TrendingUp, Users } from "lucide-react";

interface OverviewCardsProps {
  overview: OverviewMetrics;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ overview }) => {
  const cards = [
    {
      title: "Active Projects",
      value: overview.totalProjects,
      description: "Non-archived projects",
      icon: Folder,
      iconColor: "text-blue-400 bg-blue-500/10 border-blue-500/20"
    },
    {
      title: "Total Tasks",
      value: overview.totalTasks,
      description: "Across all active projects",
      icon: CheckSquare,
      iconColor: "text-sky-400 bg-sky-500/10 border-sky-500/20"
    },
    {
      title: "Completed Tasks",
      value: overview.completedTasks,
      description: "Marked as Done",
      icon: CheckCircle2,
      iconColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
    },
    {
      title: "Completion Rate",
      value: `${overview.completionPercentage}%`,
      description: "Overall workspace velocity",
      icon: TrendingUp,
      iconColor: "text-amber-400 bg-amber-500/10 border-amber-500/20"
    },
    {
      title: "Active Team",
      value: overview.activeMembers,
      description: "Workspace collaborators",
      icon: Users,
      iconColor: "text-purple-400 bg-purple-500/10 border-purple-500/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <Card key={idx} className="border-slate-800 bg-[#161b26] p-4 flex flex-col justify-between space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">{card.title}</span>
              <div className={`h-7 w-7 rounded-md border flex items-center justify-center ${card.iconColor}`}>
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>

            <div>
              <div className="text-xl font-bold tracking-tight text-slate-100">{card.value}</div>
              <p className="text-[10px] text-slate-500 mt-0.5">{card.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
};
