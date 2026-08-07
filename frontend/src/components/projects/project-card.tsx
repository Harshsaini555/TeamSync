"use client";

import React from "react";
import Link from "next/link";
import { Project } from "@/types/project";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Users, Settings, Archive, ArrowRight } from "lucide-react";

interface ProjectCardProps {
  project: Project;
  workspaceSlug: string;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, workspaceSlug }) => {
  return (
    <Card className="border-slate-800 bg-[#161b26] hover:border-slate-700 transition-all flex flex-col justify-between group">
      <CardHeader className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div
              className="h-8 w-8 rounded-md flex items-center justify-center text-white font-mono font-bold text-xs shadow-xs"
              style={{ backgroundColor: project.color || "#3b82f6" }}
            >
              {project.key}
            </div>
            <div>
              <Link
                href={`/workspaces/${workspaceSlug}/projects/${project.key}/settings`}
                className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors block truncate max-w-[180px]"
              >
                {project.name}
              </Link>
              <div className="flex items-center space-x-2 mt-0.5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">Key: {project.key}</span>
                {project.isArchived && (
                  <span className="inline-flex items-center text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.2 rounded font-mono">
                    <Archive className="h-3 w-3 mr-1" /> Archived
                  </span>
                )}
              </div>
            </div>
          </div>

          <Link
            href={`/workspaces/${workspaceSlug}/projects/${project.key}/settings`}
            className="text-slate-500 hover:text-slate-200 transition-colors p-1 rounded hover:bg-slate-800/60"
            title="Project Settings"
          >
            <Settings className="h-4 w-4" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 space-y-4">
        <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
          {project.description || "No project overview description provided."}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center space-x-2">
            <div
              className="h-5 w-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold border border-slate-700"
              title={`Lead: ${project.leadId?.name || "Unassigned"}`}
            >
              {project.leadId?.name ? project.leadId.name.charAt(0).toUpperCase() : "L"}
            </div>
            <span className="text-[11px] text-slate-400">{project.leadId?.name || "Unassigned Lead"}</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="flex items-center text-[11px] text-slate-500" title="Project Members">
              <Users className="h-3.5 w-3.5 mr-1 text-slate-400" />
              {project.members?.length || 1}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
