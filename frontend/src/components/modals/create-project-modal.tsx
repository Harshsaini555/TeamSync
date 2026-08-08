"use client";

import React, { useState, useEffect } from "react";
import { useProjects } from "@/hooks/use-projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { X, FolderPlus } from "lucide-react";

interface CreateProjectModalProps {
  workspaceId: string;
  isOpen: boolean;
  onClose: () => void;
  members?: any[];
}

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ workspaceId, isOpen, onClose }) => {
  const { createProject, isCreating } = useProjects(workspaceId);
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (name) {
      const generatedKey = name
        .replace(/[^a-zA-Z0-9]/g, "")
        .toUpperCase()
        .slice(0, 5);
      setKey((prev) => (prev ? prev : generatedKey));
    }
  }, [name]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !key.trim()) {
      setErrorMsg("Project name and prefix key are required.");
      return;
    }

    setErrorMsg(null);
    try {
      await createProject({ name, key: key.toUpperCase().trim(), description, color });
      setName("");
      setKey("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to create project.");
    }
  };

  const presetColors = ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#64748b"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[#161b26] border border-slate-800 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <FolderPlus className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">Create Project</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                label="Project Name"
                placeholder="e.g. Core Engine, iOS App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                label="Project Key"
                placeholder="e.g. ENG"
                value={key}
                onChange={(e) => setKey(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="What is this project focused on?"
              className="w-full rounded-md border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
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

          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800/80">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>
              Create Project
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
