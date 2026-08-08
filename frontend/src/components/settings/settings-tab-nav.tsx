"use client";

import React from "react";
import { User, Lock, Bell, Building, Users, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SettingsTab = "profile" | "security" | "notifications" | "workspace" | "members" | "danger";

interface SettingsTabNavProps {
  activeTab: SettingsTab;
  onTabChange: (tab: SettingsTab) => void;
}

export const SettingsTabNav: React.FC<SettingsTabNavProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: SettingsTab; label: string; icon: any; isDanger?: boolean }[] = [
    { id: "profile", label: "My Profile", icon: User },
    { id: "security", label: "Security & Password", icon: Lock },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "workspace", label: "Workspace Settings", icon: Building },
    { id: "members", label: "Team Members", icon: Users },
    { id: "danger", label: "Danger Zone", icon: AlertTriangle, isDanger: true }
  ];

  return (
    <div className="flex flex-wrap gap-1.5 border-b border-slate-800 pb-3">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0",
              isActive
                ? tab.isDanger
                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 font-semibold shadow-xs"
                  : "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold shadow-xs"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};
