"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces, useWorkspaceMembers } from "@/hooks/use-workspaces";
import { ProtectedRoute } from "@/components/common/protected-route";
import { WorkspaceSwitcher } from "@/components/common/workspace-switcher";
import { CreateWorkspaceModal } from "@/components/modals/create-workspace-modal";
import { InviteMemberModal } from "@/components/modals/invite-member-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { WorkspaceRole } from "@/types/workspace";
import { Users, UserPlus, Settings, Trash2, LogOut, ShieldAlert, ArrowLeft, CheckCircle2 } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export default function WorkspaceSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;

  const { userWorkspaces, activeWorkspace, activeRole } = useWorkspaces();
  const { user } = useAuth();
  const { members, isLoading: isLoadingMembers, updateRole, removeMember } = useWorkspaceMembers(activeWorkspace?._id);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [name, setName] = useState(activeWorkspace?.name || "");
  const [description, setDescription] = useState(activeWorkspace?.description || "");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = activeRole === WorkspaceRole.OWNER;
  const isAdmin = activeRole === WorkspaceRole.ADMIN || isOwner;

  const handleUpdateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;

    setErrorMsg(null);
    setSaveStatus(null);
    setIsSaving(true);

    try {
      await apiClient.patch(`/workspaces/${activeWorkspace._id}`, { name, description });
      setSaveStatus("Workspace settings updated successfully.");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to update workspace settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleChange = async (userId: string, role: WorkspaceRole) => {
    try {
      await updateRole({ userId, role });
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to update member role.");
    }
  };

  const handleRemoveMember = async (userId: string, memberName: string) => {
    const isLeaving = user?.id === userId;
    const confirmText = isLeaving
      ? "Are you sure you want to leave this workspace?"
      : `Are you sure you want to remove ${memberName} from this workspace?`;

    if (!confirm(confirmText)) return;

    try {
      await removeMember(userId);
      if (isLeaving) {
        router.push("/workspaces");
      }
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to remove member.");
    }
  };

  const handleDeleteWorkspace = async () => {
    if (!activeWorkspace) return;
    const confirmName = prompt(
      `DANGER ZONE: Type "${activeWorkspace.name}" to permanently delete this workspace and all associated projects.`
    );

    if (confirmName !== activeWorkspace.name) {
      alert("Workspace name mismatch. Deletion canceled.");
      return;
    }

    try {
      await apiClient.delete(`/workspaces/${activeWorkspace._id}`);
      router.push("/workspaces");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete workspace.");
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
              onClick={() => router.push("/workspaces")}
              className="text-slate-400 hover:text-slate-200"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Workspaces
            </Button>
            <div className="h-4 w-px bg-slate-800" />
            <div className="w-64">
              <WorkspaceSwitcher onCreateWorkspaceClick={() => setIsCreateModalOpen(true)} />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {activeWorkspace && isAdmin && (
              <Button variant="primary" size="sm" onClick={() => setIsInviteModalOpen(true)}>
                <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Invite Team
              </Button>
            )}
          </div>
        </header>

        {/* Settings Body */}
        <main className="flex-1 max-w-5xl w-full mx-auto p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-400" /> Workspace Settings
              </h1>
              <p className="text-xs text-slate-400 mt-1">Manage team members, roles, and workspace identity</p>
            </div>

            <span className="text-xs font-mono px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700">
              Role: <strong className="text-slate-100">{activeRole}</strong>
            </span>
          </div>

          {/* Section 1: General Settings */}
          {isAdmin && (
            <Card className="border-slate-800 bg-[#161b26]">
              <CardHeader>
                <CardTitle className="text-sm font-semibold">General Information</CardTitle>
                <CardDescription>Update your workspace display name and description</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleUpdateWorkspace} className="space-y-4 max-w-xl">
                  {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
                  {saveStatus && <Alert variant="success">{saveStatus}</Alert>}

                  <Input
                    label="Workspace Name"
                    defaultValue={activeWorkspace?.name}
                    onChange={(e) => setName(e.target.value)}
                  />

                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-slate-300">Workspace Description</label>
                    <textarea
                      rows={3}
                      defaultValue={activeWorkspace?.description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full rounded-md border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Section 2: Team Members & RBAC */}
          <Card className="border-slate-800 bg-[#161b26]">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold flex items-center">
                  <Users className="h-4 w-4 mr-2 text-blue-400" /> Team Members & RBAC Roles
                </CardTitle>
                <CardDescription>Manage user roles and permissions within this workspace</CardDescription>
              </div>

              {isAdmin && (
                <Button variant="outline" size="sm" onClick={() => setIsInviteModalOpen(true)}>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Invite Member
                </Button>
              )}
            </CardHeader>

            <CardContent>
              {isLoadingMembers ? (
                <div className="py-8 text-center text-xs text-slate-400">Loading workspace members...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider">
                        <th className="pb-3 px-3">Member</th>
                        <th className="pb-3 px-3">Email</th>
                        <th className="pb-3 px-3">Workspace Role</th>
                        <th className="pb-3 px-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {members.map((m) => {
                        const isSelf = user?.id === m.userId._id;
                        const isTargetOwner = m.role === WorkspaceRole.OWNER;

                        return (
                          <tr key={m._id} className="hover:bg-slate-900/40">
                            <td className="py-3 px-3 font-medium text-slate-200 flex items-center space-x-2">
                              <div className="h-7 w-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs border border-slate-700">
                                {m.userId.name ? m.userId.name.charAt(0).toUpperCase() : "U"}
                              </div>
                              <span>
                                {m.userId.name} {isSelf && <span className="text-slate-500 text-[10px]">(You)</span>}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-slate-400 font-mono">{m.userId.email}</td>

                            <td className="py-3 px-3">
                              {isAdmin && !isTargetOwner && !isSelf ? (
                                <select
                                  value={m.role}
                                  onChange={(e) => handleRoleChange(m.userId._id, e.target.value as WorkspaceRole)}
                                  className="rounded border border-slate-700 bg-slate-900 px-2 py-1 text-xs text-slate-200 focus:outline-none"
                                >
                                  <option value={WorkspaceRole.ADMIN}>Admin</option>
                                  <option value={WorkspaceRole.MEMBER}>Member</option>
                                  <option value={WorkspaceRole.GUEST}>Guest</option>
                                </select>
                              ) : (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-mono">
                                  {m.role}
                                </span>
                              )}
                            </td>

                            <td className="py-3 px-3 text-right">
                              {isSelf ? (
                                !isOwner && (
                                  <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleRemoveMember(m.userId._id, m.userId.name)}
                                  >
                                    Leave Workspace
                                  </Button>
                                )
                              ) : (
                                isAdmin &&
                                !isTargetOwner && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/40"
                                    onClick={() => handleRemoveMember(m.userId._id, m.userId.name)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
                                  </Button>
                                )
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Danger Zone: Delete Workspace */}
          {isOwner && (
            <Card className="border-rose-900/60 bg-rose-950/20">
              <CardHeader>
                <CardTitle className="text-sm font-semibold text-rose-400 flex items-center">
                  <ShieldAlert className="h-4 w-4 mr-2" /> Danger Zone
                </CardTitle>
                <CardDescription className="text-rose-300/80">
                  Permanently delete this workspace and all associated projects and issues.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end">
                <Button variant="danger" size="sm" onClick={handleDeleteWorkspace}>
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Workspace
                </Button>
              </CardContent>
            </Card>
          )}
        </main>

        {activeWorkspace && (
          <InviteMemberModal
            workspaceId={activeWorkspace._id}
            workspaceName={activeWorkspace.name}
            isOpen={isInviteModalOpen}
            onClose={() => setIsInviteModalOpen(false)}
          />
        )}

        <CreateWorkspaceModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      </div>
    </ProtectedRoute>
  );
}
