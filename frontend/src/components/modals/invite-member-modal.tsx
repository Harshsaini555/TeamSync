"use client";

import React, { useState } from "react";
import { useWorkspaceMembers } from "@/hooks/use-workspaces";
import { WorkspaceRole } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { X, UserPlus, Mail } from "lucide-react";

interface InviteMemberModalProps {
  workspaceId: string;
  workspaceName: string;
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal: React.FC<InviteMemberModalProps> = ({
  workspaceId,
  workspaceName,
  isOpen,
  onClose
}) => {
  const { inviteMember, isInviting } = useWorkspaceMembers(workspaceId);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>(WorkspaceRole.MEMBER);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg("Email address is required.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await inviteMember({ email, role });
      setSuccessMsg(`Invitation sent to ${email}`);
      setEmail("");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to send invitation.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md bg-[#161b26] border border-slate-800 rounded-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <UserPlus className="h-4 w-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-slate-100">Invite Member to {workspaceName}</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
          {successMsg && <Alert variant="success">{successMsg}</Alert>}

          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-300">Workspace Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as WorkspaceRole)}
              className="w-full rounded-md border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={WorkspaceRole.ADMIN}>Admin (Can manage projects & invite members)</option>
              <option value={WorkspaceRole.MEMBER}>Member (Can create projects & tasks)</option>
              <option value={WorkspaceRole.GUEST}>Guest (Read-only access to assigned projects)</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800/80">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Done
            </Button>
            <Button type="submit" variant="primary" size="sm" isLoading={isInviting}>
              Send Invite <Mail className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
