import React from "react";
import { ProjectProgressItem } from "@/types/dashboard";
import { Card } from "@/components/ui/card";
import { Folder, CheckCircle2 } from "lucide-react";
import Link from "next/link";

interface ProjectProgressListProps {
  projects: ProjectProgressItem[];
  workspaceSlug: string;
}

export const ProjectProgressList: React.FC<ProjectProgressListProps> = ({ projects, workspaceSlug }) => {
  return (
    <Card className="border-slate-800 bg-[#161b26] p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Folder className="h-4 w-4 text-blue-400" />
          <h3 className="text-xs font-semibold text-slate-200">Project Progress Velocity</h3>
        </div>
        <span className="text-[10px] font-mono text-slate-500">{projects.length} Projects</span>
      </div>

      <div className="space-y-3">
        {projects.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-500 italic">No active projects found.</div>
        ) : (
          projects.map((p) => (
            <div key={p.projectId} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center space-x-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: p.color || "#3b82f6" }}
                  />
                  <Link
                    href={`/workspaces/${workspaceSlug}/projects/${p.key}/board`}
                    className="font-semibold text-slate-100 hover:text-blue-400 transition-colors"
                  >
                    {p.name}
                  </Link>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.2 rounded">
                    {p.key}
                  </span>
                </div>

                <span className="font-mono text-xs font-bold text-slate-300">
                  {p.completionPercentage}%
                </span>
              </div>

              <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${p.completionPercentage}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>Completed: {p.completedTasks}</span>
                <span>Total: {p.totalTasks}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};
