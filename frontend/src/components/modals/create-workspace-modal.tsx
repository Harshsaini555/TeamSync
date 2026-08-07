"use client";

import React, { useState } from "react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { X, Building2 } from "lucide-react";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { createWorkspace, isCreating } = useWorkspaces();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Workspace name is required.");
      return;
    }

    setErrorMsg(null);
    try {
      await createWorkspace({ name, description });
      setName("");
      setDescription("");
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to create workspace.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[#161b26] border border-slate-800 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Building2 className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">Create New Workspace</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

          <Input
            label="Workspace Name"
            placeholder="e.g. Acme Engineering, Design Ops"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Description (Optional)</label>
            <textarea
              rows={3}
              placeholder="Brief description of this workspace domain"
              className="w-full rounded-md border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/80">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isCreating}>
              Create Workspace
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
