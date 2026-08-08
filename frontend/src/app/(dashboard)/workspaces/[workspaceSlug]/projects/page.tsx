"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces, useWorkspaceMembers } from "@/hooks/use-workspaces";
import { useProjects } from "@/hooks/use-projects";
import { ProtectedRoute } from "@/components/common/protected-route";
import { WorkspaceSwitcher } from "@/components/common/workspace-switcher";
import { NotificationPanel } from "@/components/common/notification-panel";
import { GlobalSearchModal } from "@/components/common/global-search-modal";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { CreateProjectModal } from "@/components/modals/create-project-modal";
import { ProjectCard } from "@/components/projects/project-card";
import { Button } from "@/components/ui/button";
import { Plus, LayoutGrid, Settings, Search } from "lucide-react";

export default function WorkspaceProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;

  const { activeWorkspace } = useWorkspaces();
  const { projects, isLoading } = useProjects(activeWorkspace?._id);
  const { members } = useWorkspaceMembers(activeWorkspace?._id);

  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const projectMembers = members.map((m) => m.userId);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800 bg-[#161b26]/50 px-6 flex items-center justify-between sticky top-0 backdrop-blur-md z-40">
          <div className="flex items-center space-x-4">
            <div className="w-64">
              <WorkspaceSwitcher onCreateWorkspaceClick={() => setIsCreateWorkspaceOpen(true)} />
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <button
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg hover:border-slate-700 transition-colors"
            >
              <Search className="h-3.5 w-3.5 text-slate-500" />
              <span>Search workspace...</span>
              <kbd className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1 py-0.2 rounded border border-slate-700">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center space-x-3">
            <NotificationPanel />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/workspaces/${workspaceSlug}/settings`)}
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" /> Settings
            </Button>
            <Button variant="primary" size="sm" onClick={() => setIsCreateProjectOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New Project
            </Button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center">
                <LayoutGrid className="h-5 w-5 mr-2 text-blue-400" /> Projects Overview
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Manage and track engineering software projects for{" "}
                <strong>{activeWorkspace?.name || workspaceSlug}</strong>
              </p>
            </div>

            <Button variant="primary" size="sm" onClick={() => setIsCreateProjectOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> New Project
            </Button>
          </div>

          {/* Projects Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 rounded-xl bg-slate-900/60 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="py-16 text-center border border-dashed border-slate-800 rounded-xl bg-[#161b26]/40 space-y-3">
              <p className="text-sm text-slate-400 font-mono">No active projects in this workspace yet.</p>
              <Button variant="primary" size="sm" onClick={() => setIsCreateProjectOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Create Your First Project
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} workspaceSlug={workspaceSlug} />
              ))}
            </div>
          )}
        </main>

        {activeWorkspace && (
          <CreateProjectModal
            workspaceId={activeWorkspace._id}
            members={projectMembers}
            isOpen={isCreateProjectOpen}
            onClose={() => setIsCreateProjectOpen(false)}
          />
        )}

        <CreateWorkspaceModal isOpen={isCreateWorkspaceOpen} onClose={() => setIsCreateWorkspaceOpen(false)} />
        <GlobalSearchModal workspaceSlug={workspaceSlug} isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
