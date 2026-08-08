"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces, useWorkspaceMembers } from "@/hooks/use-workspaces";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { ProtectedRoute } from "@/components/common/protected-route";
import { WorkspaceSwitcher } from "@/components/common/workspace-switcher";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { CreateTaskModal } from "@/components/tasks/create-task-modal";
import { KanbanBoard } from "@/components/kanban/kanban-board";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Settings, LayoutGrid } from "lucide-react";

export default function ProjectBoardPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;
  const projectKey = params.projectKey as string;

  const { activeWorkspace } = useWorkspaces();
  const { projects } = useProjects(activeWorkspace?._id);
  const { members } = useWorkspaceMembers(activeWorkspace?._id);

  const targetProject = projects.find((p) => p.key.toUpperCase() === projectKey.toUpperCase());
  const { tasks, isLoading: isLoadingTasks } = useTasks(targetProject?._id);

  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

  const projectMembers = members.map((m) => m.userId);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col h-screen overflow-hidden">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800 bg-[#161b26]/50 px-6 flex items-center justify-between shrink-0 backdrop-blur-md z-40">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/workspaces/${workspaceSlug}/projects`)}
              className="text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Projects
            </Button>
            <div className="h-4 w-px bg-slate-800" />
            <div className="w-64">
              <WorkspaceSwitcher onCreateWorkspaceClick={() => setIsCreateWorkspaceOpen(true)} />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {targetProject && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push(`/workspaces/${workspaceSlug}/projects/${projectKey}/settings`)}
                >
                  <Settings className="h-3.5 w-3.5 mr-1.5" /> Project Settings
                </Button>
                <Button variant="primary" size="sm" onClick={() => setIsCreateTaskOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> New Issue
                </Button>
              </>
            )}
          </div>
        </header>

        {/* Board Main Canvas */}
        <main className="flex-1 p-6 flex flex-col min-h-0 overflow-hidden space-y-4">
          <div className="flex items-center justify-between shrink-0">
            <div className="flex items-center space-x-3">
              <div
                className="h-7 w-7 rounded-md flex items-center justify-center text-white font-mono font-bold text-xs"
                style={{ backgroundColor: targetProject?.color || "#3b82f6" }}
              >
                {targetProject?.key || projectKey}
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center">
                  {targetProject?.name || projectKey} Board
                </h1>
                <p className="text-[11px] text-slate-400 font-mono">
                  Issue tracking and workflow view for key <strong>{projectKey}</strong>
                </p>
              </div>
            </div>

            <Button variant="primary" size="sm" onClick={() => setIsCreateTaskOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Issue (C)
            </Button>
          </div>

          {/* Kanban Board Container */}
          {targetProject ? (
            <div className="flex-1 min-h-0">
              <KanbanBoard
                projectId={targetProject._id}
                projectKey={targetProject.key}
                tasks={tasks}
                members={projectMembers}
                isLoading={isLoadingTasks}
              />
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500 font-mono">
              Loading project board...
            </div>
          )}
        </main>

        {targetProject && (
          <CreateTaskModal
            projectId={targetProject._id}
            projectKey={targetProject.key}
            members={projectMembers}
            isOpen={isCreateTaskOpen}
            onClose={() => setIsCreateTaskOpen(false)}
          />
        )}

        <CreateWorkspaceModal isOpen={isCreateWorkspaceOpen} onClose={() => setIsCreateWorkspaceOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
