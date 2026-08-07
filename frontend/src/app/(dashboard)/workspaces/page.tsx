"use client";

import React, { useState } from "react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { ProtectedRoute } from "@/components/common/protected-route";
import { WorkspaceSwitcher } from "@/components/common/workspace-switcher";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Building2, Plus, ArrowRight, ShieldCheck, Users, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function WorkspacesPage() {
  const { userWorkspaces, isLoading, switchWorkspace } = useWorkspaces();
  const { user, logout } = useAuth();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const router = useRouter();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800 bg-[#161b26]/50 px-6 flex items-center justify-between sticky top-0 backdrop-blur-md z-40">
          <div className="flex items-center space-x-3">
            <div className="h-7 w-7 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
              TS
            </div>
            <span className="text-sm font-bold tracking-tight text-slate-100">TeamSync</span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-medium text-slate-200">{user?.name}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">{user?.email}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => logout()} className="text-slate-400 hover:text-slate-200">
              <LogOut className="h-4 w-4 mr-1" /> Logout
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">Your Workspaces</h1>
              <p className="text-xs text-slate-400 mt-1">Select a workspace or create a new team workspace</p>
            </div>

            <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" /> Create Workspace
            </Button>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-36 rounded-lg bg-slate-900/50 border border-slate-800 animate-pulse" />
              ))}
            </div>
          ) : userWorkspaces.length === 0 ? (
            <Card className="border-slate-800 bg-[#161b26] p-8 text-center space-y-4">
              <Building2 className="h-12 w-12 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-base font-semibold text-slate-200">No Workspaces Found</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  You are not a member of any workspace yet. Create your first workspace to start managing projects.
                </p>
              </div>
              <Button variant="primary" size="sm" onClick={() => setIsCreateModalOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" /> Create First Workspace
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userWorkspaces.map(({ workspace, role }) => (
                <Card
                  key={workspace._id}
                  className="border-slate-800 bg-[#161b26] hover:border-slate-700 transition-all cursor-pointer group flex flex-col justify-between"
                  onClick={() => {
                    switchWorkspace(workspace.slug);
                    router.push(`/workspaces/${workspace.slug}/settings`);
                  }}
                >
                  <CardHeader className="p-5 pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-9 w-9 rounded-md bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                          {workspace.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="text-sm font-semibold text-slate-100 group-hover:text-blue-400 transition-colors">
                            {workspace.name}
                          </CardTitle>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">/{workspace.slug}</p>
                        </div>
                      </div>

                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/60">
                        {role}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="p-5 pt-2 space-y-3">
                    <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
                      {workspace.description || "No workspace description provided."}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
                      <span className="flex items-center text-[11px] text-slate-400">
                        <Users className="h-3.5 w-3.5 mr-1" /> Active Workspace
                      </span>

                      <span className="inline-flex items-center text-blue-400 font-medium group-hover:translate-x-1 transition-transform">
                        Open <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        <CreateWorkspaceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
