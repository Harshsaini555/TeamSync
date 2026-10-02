"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/common/protected-route";

export default function ProjectIndexPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.workspaceSlug as string;
  const projectKey = params.projectKey as string;

  useEffect(() => {
    if (workspaceSlug && projectKey) {
      router.replace(`/workspaces/${workspaceSlug}/projects/${projectKey}/board`);
    }
  }, [workspaceSlug, projectKey, router]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center text-slate-400 text-xs font-mono">
        Redirecting to project board...
      </div>
    </ProtectedRoute>
  );
}
