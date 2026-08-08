"use client";

import React, { useState } from "react";
import { useAuth } from "@/providers/auth-provider";
import { apiClient } from "@/lib/api-client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Bell, Mail, UserCheck, AtSign } from "lucide-react";

export const NotificationPreferencesForm: React.FC = () => {
  const { user } = useAuth();
  const prefs = user?.notificationPreferences || { emailAlerts: true, taskAssigned: true, commentMentions: true };

  const [emailAlerts, setEmailAlerts] = useState(prefs.emailAlerts);
  const [taskAssigned, setTaskAssigned] = useState(prefs.taskAssigned);
  const [commentMentions, setCommentMentions] = useState(prefs.commentMentions);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      await apiClient.patch("/auth/me/notifications", {
        emailAlerts,
        taskAssigned,
        commentMentions
      });
      setSuccessMsg("Notification preferences updated.");
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || "Failed to update notification settings.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggles = [
    {
      title: "Email Digest Alerts",
      description: "Receive periodic email summaries of issue updates and mentions.",
      icon: Mail,
      state: emailAlerts,
      setter: setEmailAlerts
    },
    {
      title: "Task Assigned Alerts",
      description: "Get real-time push and email notifications when assigned to a task.",
      icon: UserCheck,
      state: taskAssigned,
      setter: setTaskAssigned
    },
    {
      title: "@User Mentions",
      description: "Notify me immediately whenever someone @mentions me in task comments.",
      icon: AtSign,
      state: commentMentions,
      setter: setCommentMentions
    }
  ];

  return (
    <Card className="border-slate-800 bg-[#161b26] p-6 max-w-2xl space-y-6">
      <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
        <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center">
          <Bell className="h-4 w-4" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-100">Notification Preferences</h3>
          <p className="text-xs text-slate-400">Configure how and when TeamSync alerts you.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {successMsg && <Alert variant="success">{successMsg}</Alert>}
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}

        <div className="space-y-3">
          {toggles.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3 pr-4">
                  <Icon className="h-4 w-4 text-slate-400 shrink-0" />
                  <div>
                    <h4 className="text-xs font-semibold text-slate-200">{item.title}</h4>
                    <p className="text-[11px] text-slate-400 leading-snug">{item.description}</p>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={item.state}
                    onChange={(e) => item.setter(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-300 after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800/80">
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            Save Preferences
          </Button>
        </div>
      </form>
    </Card>
  );
};
