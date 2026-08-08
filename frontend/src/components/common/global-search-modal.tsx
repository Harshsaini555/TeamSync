"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWorkspaces } from "@/hooks/use-workspaces";
import { useDebounce } from "@/hooks/use-debounce";
import { useGlobalSearch } from "@/hooks/use-global-search";
import { SearchCategory } from "@/types/search";
import { Search, X, Folder, CheckSquare, User, MessageSquare, Loader2, ArrowRight } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { PriorityBadge } from "./priority-badge";
import { cn } from "@/lib/utils";

interface GlobalSearchModalProps {
  workspaceSlug: string;
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ workspaceSlug, isOpen, onClose }) => {
  const router = useRouter();
  const { activeWorkspace } = useWorkspaces();

  const [rawQuery, setRawQuery] = useState("");
  const [category, setCategory] = useState<SearchCategory>("all");
  const debouncedQuery = useDebounce(rawQuery, 300);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage
  } = useGlobalSearch(activeWorkspace?._id, debouncedQuery, category);

  // Global Keyboard Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Flatten infinite query pages
  const allTasks = data?.pages.flatMap((page) => page?.results?.tasks || []) || [];
  const allProjects = data?.pages.flatMap((page) => page?.results?.projects || []) || [];
  const allUsers = data?.pages.flatMap((page) => page?.results?.users || []) || [];
  const allComments = data?.pages.flatMap((page) => page?.results?.comments || []) || [];

  const totalFound = allTasks.length + allProjects.length + allUsers.length + allComments.length;

  const categories: { id: SearchCategory; label: string; count: number }[] = [
    { id: "all", label: "All Results", count: totalFound },
    { id: "tasks", label: "Tasks", count: allTasks.length },
    { id: "projects", label: "Projects", count: allProjects.length },
    { id: "users", label: "Users", count: allUsers.length },
    { id: "comments", label: "Comments", count: allComments.length }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 bg-black/75 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-[#161b26] border border-slate-800 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 bg-slate-900/60 shrink-0">
          <Search className="h-4 w-4 text-blue-400 mr-3 shrink-0" />
          <input
            type="text"
            placeholder="Search projects, tasks, users, or comments... (Cmd+K)"
            value={rawQuery}
            onChange={(e) => setRawQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
            autoFocus
          />
          {rawQuery && (
            <button onClick={() => setRawQuery("")} className="text-slate-400 hover:text-slate-200 mr-2">
              <X className="h-4 w-4" />
            </button>
          )}
          <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
            ESC
          </span>
        </div>

        {/* Category Tabs */}
        {rawQuery.trim().length >= 2 && (
          <div className="flex items-center space-x-1 px-4 py-2 border-b border-slate-800/80 bg-[#161b26] shrink-0 overflow-x-auto custom-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={cn(
                  "px-2.5 py-1 rounded text-xs font-medium transition-colors shrink-0 flex items-center space-x-1",
                  category === cat.id
                    ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 font-semibold"
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                )}
              >
                <span>{cat.label}</span>
                {cat.count > 0 && (
                  <span className="text-[10px] font-mono bg-slate-800 px-1.5 py-0.2 rounded text-slate-300">
                    {cat.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Results Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {rawQuery.trim().length < 2 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-mono">
              Type at least 2 characters to search across workspace...
            </div>
          ) : isLoading ? (
            <div className="py-12 flex flex-col items-center space-y-2 text-xs text-slate-400">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
              <span>Searching workspace index...</span>
            </div>
          ) : totalFound === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500 font-mono">
              No results found matching &quot;{debouncedQuery}&quot;.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Projects Section */}
              {(category === "all" || category === "projects") && allProjects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Projects ({allProjects.length})</span>
                  <div className="space-y-1">
                    {allProjects.map((p) => (
                      <div
                        key={p._id}
                        onClick={() => {
                          onClose();
                          router.push(`/workspaces/${workspaceSlug}/projects/${p.key}/board`);
                        }}
                        className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors text-xs"
                      >
                        <div className="flex items-center space-x-3">
                          <div
                            className="h-6 w-6 rounded flex items-center justify-center text-white font-mono font-bold text-[10px]"
                            style={{ backgroundColor: p.color || "#3b82f6" }}
                          >
                            {p.key}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-100">{p.name}</span>
                            <span className="text-[10px] text-slate-500 ml-2 font-mono">/{p.key}</span>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks Section */}
              {(category === "all" || category === "tasks") && allTasks.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Tasks ({allTasks.length})</span>
                  <div className="space-y-1">
                    {allTasks.map((t) => (
                      <div
                        key={t._id}
                        onClick={() => {
                          onClose();
                          router.push(`/workspaces/${workspaceSlug}/projects/${t.projectId?.key}/board`);
                        }}
                        className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 cursor-pointer flex items-center justify-between transition-colors text-xs"
                      >
                        <div className="flex items-center space-x-3 min-w-0 pr-2">
                          <CheckSquare className="h-4 w-4 text-blue-400 shrink-0" />
                          <div className="min-w-0">
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-bold text-blue-400 shrink-0">{t.taskKey}</span>
                              <span className="font-semibold text-slate-100 truncate">{t.title}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 shrink-0">
                          <StatusBadge status={t.status} />
                          <PriorityBadge priority={t.priority} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users Section */}
              {(category === "all" || category === "users") && allUsers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Users ({allUsers.length})</span>
                  <div className="space-y-1">
                    {allUsers.map((u) => (
                      <div
                        key={u.id}
                        className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center space-x-2.5">
                          <div className="h-6 w-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-[10px] border border-slate-700">
                            {u.name ? u.name.charAt(0).toUpperCase() : "U"}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-200">{u.name}</span>
                            <span className="text-slate-500 text-[10px] font-mono ml-2">({u.email})</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {(category === "all" || category === "comments") && allComments.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-slate-500 tracking-wider">Comments ({allComments.length})</span>
                  <div className="space-y-1">
                    {allComments.map((c) => (
                      <div
                        key={c._id}
                        onClick={() => {
                          onClose();
                          if (c.taskId?.projectId?.key) {
                            router.push(`/workspaces/${workspaceSlug}/projects/${c.taskId.projectId.key}/board`);
                          }
                        }}
                        className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 cursor-pointer space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-mono font-bold text-blue-400">{c.taskId?.taskKey}</span>
                          <span className="text-slate-500 font-mono text-[10px]">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-slate-300 line-clamp-2 italic">&quot;{c.content}&quot;</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Load More Button for Cursor Pagination */}
              {hasNextPage && (
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="text-xs text-blue-400 hover:text-blue-300 font-medium font-mono inline-flex items-center space-x-1"
                  >
                    {isFetchingNextPage ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin mr-1" />
                        <span>Loading next page...</span>
                      </>
                    ) : (
                      <span>Load More Results ↓</span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
