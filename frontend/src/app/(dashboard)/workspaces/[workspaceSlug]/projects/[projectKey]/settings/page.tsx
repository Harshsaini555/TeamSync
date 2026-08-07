"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWorkspaces, useWorkspaceMembers } from "@/hooks/use-workspaces";
import { useProjects } from "@/hooks/use-projects";
import { ProtectedRoute } from "@/components/common/protected-route";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Settings, ArrowLeft, Archive, Trash2, ShieldAlert } from "lucide-react";
import { apiClient } from "@/lib/api-client";

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;
  const projectKey = params.projectKey as string;

  const { activeWorkspace } = useWorkspaces();
  const { projects } = useProjects(activeWorkspace?._id, true);
  const { members } = useWorkspaceMembers(activeWorkspace?._id);

  const targetProject = projects.find((p) => p.key.toUpperCase() === projectKey.toUpperCase());

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [leadId, setLeadId] = useState("");
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (targetProject) {
      setName(targetProject.name);
      setDescription(targetProject.description || "");
      setColor(targetProject.color || "#3b82f6");
      setLeadId(targetProject.leadId?._id || "");
    }
  }, [targetProject]);

  if (!targetProject) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
          <Card className="border-slate-800 bg-[#161b26] p-8 text-center space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Project Not Found</h3>
            <p className="text-xs text-slate-400">The project key {projectKey} does not exist in this workspace.</p>
            <Button variant="primary" size="sm" onClick={() => router.push(`/workspaces/${workspaceSlug}/projects`)}>
              Back to Projects
            </Button>
          </Card>
        </div>
      </ProtectedRoute>
    );
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaveStatus(null);
    setIsSaving(true);

    try {
      await apiClient.patch(`/projects/${targetProject._id}`, {
        name,
        description,
        color,
        leadId
      });
      setSaveStatus("Project details updated successfully.");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to update project settings.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleArchive = async () => {
    const nextState = !targetProject.isArchived;
    const confirmMsg = nextState
      ? `Archive project "${targetProject.name}"?`
      : `Restore project "${targetProject.name}"?`;

    if (!confirm(confirmMsg)) return;

    try {
      await apiClient.patch(`/projects/${targetProject._id}/archive`, { isArchived: nextState });
      router.push(`/workspaces/${workspaceSlug}/projects`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to toggle archive status.");
    }
  };

  const handleDelete = async () => {
    const confirmInput = prompt(`DANGER ZONE: Type "${targetProject.key}" to permanently delete this project.`);
    if (confirmInput !== targetProject.key) {
      alert("Key mismatch. Deletion canceled.");
      return;
    }

    try {
      await apiClient.delete(`/projects/${targetProject._id}`);
      router.push(`/workspaces/${workspaceSlug}/projects`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete project.");
    }
  };

  const presetColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

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
            <div className="flex items-center space-x-2">
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: targetProject.color || "#3b82f6" }}
              />
              <span className="text-xs font-bold text-slate-100">{targetProject.name}</span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                {targetProject.key}
              </span>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-8 space-y-8">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100 flex items-center">
                <Settings className="h-5 w-5 mr-2 text-blue-400" /> Project Settings
              </h1>
              <p className="text-xs text-slate-400 mt-1">Configure project metadata, assigned lead, and status</p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleArchive}
              className="text-slate-300 hover:text-white"
            >
              <Archive className="h-3.5 w-3.5 mr-1.5" />
              {targetProject.isArchived ? "Restore Project" : "Archive Project"}
            </Button>
          </div>

          <Card className="border-slate-800 bg-[#161b26]">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">General Metadata</CardTitle>
              <CardDescription>Project name, description, and assigned lead</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleUpdate} className="space-y-4 max-w-lg">
                {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
                {saveStatus && <Alert variant="success">{saveStatus}</Alert>}

                <Input label="Project Name" value={name} onChange={(e) => setName(e.target.value)} required />

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Project Key (Read-only)</label>
                  <input
                    type="text"
                    disabled
                    value={targetProject.key}
                    className="w-full h-9 rounded-md border border-slate-800 bg-slate-950 px-3 text-sm text-slate-500 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Description</label>
                  <textarea
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-md border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Project Lead</label>
                  <select
                    value={leadId}
                    onChange={(e) => setLeadId(e.target.value)}
                    className="w-full rounded-md border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none"
                  >
                    {members.map((m) => (
                      <option key={m.userId._id} value={m.userId._id}>
                        {m.userId.name} ({m.userId.email})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-300">Accent Color</label>
                  <div className="flex items-center space-x-2">
                    {presetColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`h-6 w-6 rounded-full border-2 transition-transform ${
                          color === c ? "border-white scale-110" : "border-transparent hover:scale-105"
                        }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>

                <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                  Save Project Changes
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-rose-900/60 bg-rose-950/20">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-rose-400 flex items-center">
                <ShieldAlert className="h-4 w-4 mr-2" /> Danger Zone
              </CardTitle>
              <CardDescription className="text-rose-300/80">
                Permanently remove this project and all associated task records.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end">
              <Button variant="danger" size="sm" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Project
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  );
}
