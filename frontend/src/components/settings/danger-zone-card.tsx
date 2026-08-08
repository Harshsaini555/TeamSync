"use client";

import React, { useState } from "react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useAuth } from "@/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { AlertTriangle, Trash2 } from "lucide-react";

interface DangerZoneCardProps {
  workspaceId: string;
}

export const DangerZoneCard: React.FC<DangerZoneCardProps> = ({ workspaceId }) => {
  const router = useRouter();
  const { logout } = useAuth();
  const { activeWorkspace, deleteWorkspace, isDeletingWorkspace } = useWorkspaces();

  const [confirmText, setConfirmText] = useState("");
  const [targetAction, setTargetAction] = useState<"workspace" | "account" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDeleteWorkspace = async () => {
    if (confirmText !== "DELETE") return;
    setErrorMsg(null);
    try {
      await deleteWorkspace(workspaceId);
      router.push("/workspaces");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to delete workspace.");
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmText !== "DELETE") return;
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await apiClient.delete("/auth/me");
      logout();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to delete account.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-rose-900/40 bg-[#170e13] p-6 max-w-2xl space-y-6">
      <div className="flex items-center space-x-3 border-b border-rose-900/40 pb-4">
        <div className="h-8 w-8 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center">
          <AlertTriangle className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-rose-200">Danger Zone</h3>
          <p className="text-xs text-rose-400/80">Irreversible actions for your account and workspace.</p>
        </div>
      </div>

      {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

      <div className="space-y-4">
        {/* Workspace Deletion */}
        <div className="p-4 rounded-lg border border-rose-900/60 bg-rose-950/20 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-100">Delete Workspace &quot;{activeWorkspace?.name}&quot;</h4>
            <p className="text-[11px] text-slate-400">Permanently delete all projects, tasks, and member records.</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setTargetAction("workspace");
              setConfirmText("");
            }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Workspace
          </Button>
        </div>

        {/* Account Deletion */}
        <div className="p-4 rounded-lg border border-rose-900/60 bg-rose-950/20 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-slate-100">Delete Personal Account</h4>
            <p className="text-[11px] text-slate-400">Permanently delete your profile and revoke workspace access.</p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setTargetAction("account");
              setConfirmText("");
            }}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete Account
          </Button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {targetAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-[#161b26] border border-rose-800 rounded-lg p-5 space-y-4">
            <h4 className="text-sm font-bold text-rose-400 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2" /> Confirm Destructive Action
            </h4>
            <p className="text-xs text-slate-300">
              Type <strong>DELETE</strong> below to confirm permanent deletion of your{" "}
              {targetAction === "workspace" ? "workspace" : "account"}.
            </p>

            <Input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="Type DELETE"
            />

            <div className="flex items-center justify-end space-x-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setTargetAction(null)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={confirmText !== "DELETE"}
                isLoading={isDeletingWorkspace || isSubmitting}
                onClick={targetAction === "workspace" ? handleDeleteWorkspace : handleDeleteAccount}
              >
                Permanently Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
