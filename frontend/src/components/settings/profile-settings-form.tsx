"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert } from "@/components/ui/alert";
import { User, CheckCircle2 } from "lucide-react";

export const ProfileSettingsForm: React.FC = () => {
  const { user } = useAuth();
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      await apiClient.patch("/auth/me/profile", { name, avatarUrl, bio });
      setSuccessMsg("Profile updated successfully.");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-[#161b26] p-6 max-w-2xl space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <div className="h-8 w-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
          <User className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Personal Profile</h3>
          <p className="text-xs text-slate-400">Manage your name, public bio, and avatar representation.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && <Alert variant="success">{successMsg}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <Input
          label="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Alex Rivera"
          required
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Email Address (Read only)</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full rounded-md border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-500 cursor-not-allowed"
          />
        </div>

        <Input
          label="Avatar Image URL (Optional)"
          value={avatarUrl}
          onChange={(e) => setAvatarUrl(e.target.value)}
          placeholder="https://images.unsplash.com/photo-..."
        />

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-300">Public Bio / Role</label>
          <textarea
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="e.g. Senior Frontend Engineer @ TeamSync"
            className="w-full rounded-md border border-slate-700/80 bg-slate-900/90 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
            maxLength={300}
          />
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800/80">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save Profile Changes
          </Button>
        </div>
      </form>
    </Card>
  );
};
