"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useProjects } from "@/hooks/use-projects";
import { ProtectedRoute } from "@/components/common/protected-route";
import { WorkspaceSwitcher } from "@/components/common/workspace-switcher";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Folder, Plus, ArrowLeft, Archive, Search, Filter } from "lucide-react";

export default function WorkspaceProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;

  const { activeWorkspace } = useWorkspaces();
  const [includeArchived, setIncludeArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

  const { projects, isLoading } = useProjects(activeWorkspace?._id, includeArchived);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.key.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800 bg-[#161b26]/50 px-6 flex items-center justify-between sticky top-0 backdrop-blur-md z-40">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/workspaces/${workspaceSlug}/settings`)}
              className="text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Settings
            </Button>
            <div className="h-4 w-px bg-slate-800" />
            <div className="w-64">
              <WorkspaceSwitcher onCreateWorkspaceClick={() => setIsCreateWorkspaceOpen(true)} />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {activeWorkspace && (
              <Button variant="primary" size="sm" onClick={() => setIsCreateProjectOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> New Project
              </Button>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-6xl w-full mx-auto p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center">
                <Folder className="h-5 w-5 mr-2 text-blue-400" /> Projects Overview
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Active engineering projects under <strong>{activeWorkspace?.name || workspaceSlug}</strong>
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={() => setIsCreateProjectOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Project
            </Button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Filter by name or key..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-slate-900 border border-slate-800 rounded-md text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
              />
            </div>

            <button
              type="button"
              onClick={() => setIncludeArchived(!includeArchived)}
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1.5 rounded-md border transition-colors ${
                includeArchived
                  ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
                  : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
              }`}
            >
              <Archive className="h-3.5 w-3.5" />
              <span>{includeArchived ? "Archived Included" : "Hide Archived"}</span>
            </button>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-lg bg-slate-900/50 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : filteredProjects.length === 0 ? (
            <Card className="border-slate-800 bg-[#161b26] p-8 text-center space-y-3">
              <Folder className="h-10 w-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-semibold text-slate-200">No Projects Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No projects match your current view. Create a project to start tracking issues.
              </p>
              {activeWorkspace && (
                <Button variant="primary" size="sm" onClick={() => setIsCreateProjectOpen(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Project
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProjects.map((project) => (
                <ProjectCard key={project._id} project={project} workspaceSlug={workspaceSlug} />
              ))}
            </div>
          )}
        </main>

        {activeWorkspace && (
          <CreateProjectModal
            workspaceId={activeWorkspace._id}
            isOpen={isCreateProjectOpen}
            onClose={() => setIsCreateProjectOpen(false)}
          />
        )}

        <CreateWorkspaceModal isOpen={isCreateWorkspaceOpen} onClose={() => setIsCreateWorkspaceOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
