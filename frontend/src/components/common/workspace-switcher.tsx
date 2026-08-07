"use client";

import React, { useState, useRef, useEffect } from "react";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { Check, ChevronsUpDown, Plus, Building2, ShieldCheck, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceRole } from "@/types/workspace";

interface WorkspaceSwitcherProps {
  onCreateWorkspaceClick?: () => void;
}

export const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({ onCreateWorkspaceClick }) => {
  const { userWorkspaces, activeWorkspace, activeRole, switchWorkspace } = useWorkspaces();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getRoleBadge = (role?: WorkspaceRole) => {
    switch (role) {
      case WorkspaceRole.OWNER:
        return <span className="text-[10px] bg-amber-500/10 text-amber-400 border border-amber-500/20 px-1.5 py-0.5 rounded font-mono font-medium">Owner</span>;
      case WorkspaceRole.ADMIN:
        return <span className="text-[10px] bg-blue-500/10 text-blue-400 border border-blue-500/20 px-1.5 py-0.5 rounded font-mono font-medium">Admin</span>;
      case WorkspaceRole.MEMBER:
        return <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">Member</span>;
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 transition-colors text-left focus:outline-none focus:ring-1 focus:ring-blue-500/50",
          isOpen && "border-slate-700 bg-slate-800/80"
        )}
      >
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="h-7 w-7 rounded bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
            {activeWorkspace?.name ? activeWorkspace.name.charAt(0).toUpperCase() : "W"}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-100 truncate">
                {activeWorkspace?.name || "Select Workspace"}
              </span>
              {getRoleBadge(activeRole)}
            </div>
            <p className="text-[10px] text-slate-500 truncate">{activeWorkspace?.slug || "No active workspace"}</p>
          </div>
        </div>
        <ChevronsUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-1" />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-full z-50 rounded-lg border border-slate-800 bg-[#161b26] p-1.5 shadow-2xl space-y-1">
          <div className="px-2 py-1 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
            Workspaces ({userWorkspaces.length})
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {userWorkspaces.map(({ workspace, role }) => {
              const isSelected = workspace.slug === activeWorkspace?.slug;
              return (
                <button
                  key={workspace._id}
                  type="button"
                  onClick={() => {
                    switchWorkspace(workspace.slug);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between px-2 py-1.5 rounded-md text-left text-xs transition-colors",
                    isSelected
                      ? "bg-blue-600/10 text-blue-400 font-medium border border-blue-500/20"
                      : "text-slate-300 hover:bg-slate-800/80 hover:text-slate-100"
                  )}
                >
                  <div className="flex items-center space-x-2 min-w-0">
                    <div className="h-6 w-6 rounded bg-slate-800 flex items-center justify-center text-slate-300 font-medium text-[11px] shrink-0 border border-slate-700/60">
                      {workspace.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="truncate text-xs">{workspace.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{role}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="h-3.5 w-3.5 text-blue-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="border-t border-slate-800/80 pt-1 mt-1">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                if (onCreateWorkspaceClick) onCreateWorkspaceClick();
              }}
              className="w-full flex items-center space-x-2 px-2 py-1.5 rounded-md text-xs text-blue-400 hover:bg-blue-600/10 font-medium transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create New Workspace</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
