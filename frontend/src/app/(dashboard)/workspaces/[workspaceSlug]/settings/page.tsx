"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces, useWorkspaceMembers } from "@/hooks/use-workspaces";
import { ProtectedRoute } from "@/components/common/protected-route";
import { WorkspaceSwitcher } from "@/components/common/workspace-switcher";
import { NotificationPanel } from "@/components/common/notification-panel";
import { SettingsTabNav, SettingsTab } from "@/components/settings/settings-tab-nav";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PasswordChangeForm } from "@/components/settings/password-change-form";
import { NotificationPreferencesForm } from "@/components/settings/notification-preferences-form";
import { DangerZoneCard } from "@/components/settings/danger-zone-card";
import { InviteMemberModal } from "@/components/modals/invite-member-modal";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Settings, ArrowLeft, Building, Users, UserPlus, Shield } from "lucide-react";
import { WorkspaceRole } from "@/types";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;

  const { activeWorkspace, updateWorkspace, isUpdatingWorkspace } = useWorkspaces();
  const { members, updateRole, removeMember } = useWorkspaceMembers(activeWorkspace?._id);

  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false);

  // Workspace form state
  const [wsName, setWsName] = useState(activeWorkspace?.name || "");
  const [wsLogoUrl, setWsLogoUrl] = useState(activeWorkspace?.logoUrl || "");
  const [wsSuccessMsg, setWsSuccessMsg] = useState<string | null>(null);
  const [wsErrorMsg, setWsErrorMsg] = useState<string | null>(null);

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    setWsSuccessMsg(null);
    setWsErrorMsg(null);

    try {
      await updateWorkspace({ workspaceId: activeWorkspace._id, name: wsName, logoUrl: wsLogoUrl });
      setWsSuccessMsg("Workspace settings updated.");
    } catch (err: any) {
      setWsErrorMsg(err?.response?.data?.message || "Failed to update workspace.");
    }
  };

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
          </div>
        </header>

        {/* Settings Main Canvas */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-6">
          <div className="border-b border-slate-800/80 pb-5">
            <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-400" /> Settings & Workspace Preferences
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Manage personal profile, security, notification rules, workspace branding, and team members.
            </p>
          </div>

          {/* Tab Navigation */}
          <SettingsTabNav activeTab={activeTab} onTabChange={setActiveTab} />

          {/* Tab 1: Profile */}
          {activeTab === "profile" && <ProfileSettingsForm />}

          {/* Tab 2: Security */}
          {activeTab === "security" && <PasswordChangeForm />}

          {/* Tab 3: Notifications */}
          {activeTab === "notifications" && <NotificationPreferencesForm />}

          {/* Tab 4: Workspace Settings */}
          {activeTab === "workspace" && (
            <Card className="border-slate-800 bg-[#161b26] p-6 max-w-2xl space-y-6">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
                <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
                  <Building className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-100">Workspace General Settings</h3>
                  <p className="text-xs text-slate-400">Update workspace name and logo branding.</p>
                </div>
              </div>

              <form onSubmit={handleUpdateWorkspace} className="space-y-4">
                {wsSuccessMsg && <Alert variant="success">{wsSuccessMsg}</Alert>}
                {wsErrorMsg && <Alert variant="error">{wsErrorMsg}</Alert>}

                <Input
                  label="Workspace Name"
                  value={wsName}
                  onChange={(e) => setWsName(e.target.value)}
                  required
                />

                <Input
                  label="Workspace Logo URL (Optional)"
                  value={wsLogoUrl}
                  onChange={(e) => setWsLogoUrl(e.target.value)}
                  placeholder="https://..."
                />

                <div className="flex justify-end pt-3 border-t border-slate-800/80">
                  <Button type="submit" variant="primary" size="sm" isLoading={isUpdatingWorkspace}>
                    Save Workspace Settings
                  </Button>
                </div>
              </form>
            </Card>
          )}

          {/* Tab 5: Team Members */}
          {activeTab === "members" && (
            <Card className="border-slate-800 bg-[#161b26] p-6 max-w-4xl space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-100">Team Members & Role-Based Access</h3>
                    <p className="text-xs text-slate-400">Manage permissions across OWNER, ADMIN, MEMBER, and GUEST roles.</p>
                  </div>
                </div>

                <Button variant="primary" size="sm" onClick={() => setIsInviteOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Invite Member
                </Button>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase bg-slate-900/60">
                      <th className="py-2.5 px-4">User</th>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {members.map((m) => (
                      <tr key={m._id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2.5">
                            <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-[10px] border border-slate-700">
                              {m.userId.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-200">{m.userId.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{m.userId.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <select
                            value={m.role}
                            onChange={(e) => updateRole({ userId: m.userId._id, role: e.target.value as WorkspaceRole })}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
                          >
                            <option value={WorkspaceRole.OWNER}>OWNER</option>
                            <option value={WorkspaceRole.ADMIN}>ADMIN</option>
                            <option value={WorkspaceRole.MEMBER}>MEMBER</option>
                            <option value={WorkspaceRole.GUEST}>GUEST</option>
                          </select>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => removeMember(m.userId._id)}
                            className="text-xs text-rose-400 hover:text-rose-300 font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Tab 6: Danger Zone */}
          {activeTab === "danger" && activeWorkspace && (
            <DangerZoneCard workspaceId={activeWorkspace._id} />
          )}
        </main>

        {activeWorkspace && (
          <InviteMemberModal
            workspaceId={activeWorkspace._id}
            isOpen={isInviteOpen}
            onClose={() => setIsInviteOpen(false)}
          />
        )}

        <CreateWorkspaceModal isOpen={isCreateWorkspaceOpen} onClose={() => setIsCreateWorkspaceOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
