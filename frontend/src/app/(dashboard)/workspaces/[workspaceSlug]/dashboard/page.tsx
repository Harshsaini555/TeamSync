"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useDashboardData } from "@/hooks/use-dashboard";
import { ProtectedRoute } from "@/components/common/protected-route";
import { WorkspaceSwitcher } from "@/components/common/workspace-switcher";
import { NotificationPanel } from "@/components/common/notification-panel";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { OverviewCards } from "@/components/dashboard/overview-cards";
import { CleanChartBars } from "@/components/dashboard/clean-chart-bars";
import { ProjectProgressList } from "@/components/dashboard/project-progress-list";
import { UpcomingDeadlinesList } from "@/components/dashboard/upcoming-deadlines-list";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { LayoutDashboard, ArrowLeft, Activity, Folder, Plus } from "lucide-react";

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;

  const { activeWorkspace } = useWorkspaces();
  const { dashboardData, isLoading } = useDashboardData(activeWorkspace?._id);

  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
        {/* Top Navbar */}
        <header className="h-14 border-b border-slate-800 bg-[#161b26]/50 px-6 flex items-center justify-between sticky top-0 backdrop-blur-md z-40">
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
            <NotificationPanel />
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/workspaces/${workspaceSlug}/settings`)}
            >
              Workspace Settings
            </Button>
          </div>
        </header>

        {/* Dashboard Main Canvas */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center">
                <LayoutDashboard className="h-5 w-5 mr-2 text-blue-400" /> Workspace Executive Dashboard
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time velocity metrics, project progress, and workload distribution for{" "}
                <strong>{activeWorkspace?.name || workspaceSlug}</strong>
              </p>
            </div>
          </div>

          {isLoading || !dashboardData ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-24 rounded-lg bg-slate-900/60 border border-slate-800" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-64 rounded-lg bg-slate-900/60 border border-slate-800" />
                <div className="h-64 rounded-lg bg-slate-900/60 border border-slate-800" />
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Section 1: Overview Cards */}
              <OverviewCards overview={dashboardData.overview} />

              {/* Section 2: Distribution Charts */}
              <CleanChartBars
                taskDistribution={dashboardData.taskDistribution}
                priorityDistribution={dashboardData.priorityDistribution}
              />

              {/* Section 3: Project Progress Velocity & Upcoming Deadlines */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ProjectProgressList projects={dashboardData.projectProgress} workspaceSlug={workspaceSlug} />
                <UpcomingDeadlinesList tasks={dashboardData.upcomingDeadlines} />
              </div>

              {/* Section 4: Recent Activity Stream */}
              <Card className="border-slate-800 bg-[#161b26] p-5 space-y-4">
                <div className="flex items-center space-x-2">
                  <Activity className="h-4 w-4 text-amber-400" />
                  <h3 className="text-xs font-semibold text-slate-200">Recent Workspace Activity Stream</h3>
                </div>

                <div className="space-y-2.5">
                  {dashboardData.recentActivity.length === 0 ? (
                    <div className="py-6 text-center text-xs text-slate-500 italic">No activity recorded yet.</div>
                  ) : (
                    dashboardData.recentActivity.map((activity) => (
                      <div
                        key={activity._id}
                        className="p-3 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-[10px] border border-slate-700">
                            {activity.userId?.name ? activity.userId.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <span className="font-semibold text-slate-200">{activity.userId?.name}</span>
                          <span className="text-slate-400">{activity.details}</span>
                        </div>

                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(activity.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          )}
        </main>

        <CreateWorkspaceModal isOpen={isCreateWorkspaceOpen} onClose={() => setIsCreateWorkspaceOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
