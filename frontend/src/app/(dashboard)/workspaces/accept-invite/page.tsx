"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/common/protected-route";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2, Building2 } from "lucide-react";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");
  const [workspaceSlug, setWorkspaceSlug] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Invitation token is missing from the URL.");
      return;
    }

    const doAccept = async () => {
      try {
        const res = await apiClient.post("/workspaces/accept-invite", { token });
        setStatus("success");
        setMessage(res.data.message);
        if (res.data.data?.slug) {
          setWorkspaceSlug(res.data.data.slug);
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Failed to accept workspace invitation.");
      }
    };

    doAccept();
  }, [token]);

  return (
    <Card className="border-slate-800 bg-[#161b26] max-w-md w-full p-2">
      <CardHeader className="text-center">
        <CardTitle className="text-base font-semibold flex items-center justify-center space-x-2">
          <Building2 className="h-5 w-5 text-blue-400" />
          <span>Workspace Invitation</span>
        </CardTitle>
        <CardDescription>Joining team workspace on TeamSync</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 text-center py-4">
        {status === "loading" && (
          <div className="py-8 flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-xs text-slate-400">Verifying invitation token...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <Alert variant="success">{message}</Alert>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => {
                if (workspaceSlug) {
                  router.push(`/workspaces/${workspaceSlug}/settings`);
                } else {
                  router.push("/workspaces");
                }
              }}
            >
              Go to Workspace
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="h-12 w-12 text-rose-400 mx-auto" />
            <Alert variant="error">{message}</Alert>
            <Button variant="outline" className="w-full" onClick={() => router.push("/workspaces")}>
              View Your Workspaces
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AcceptInvitePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
        <Suspense fallback={<div className="text-slate-400 text-xs">Loading invitation...</div>}>
          <AcceptInviteContent />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
