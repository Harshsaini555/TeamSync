"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Command, CheckCircle2, XCircle, Loader2 } from "lucide-react";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { verifyEmail } = useAuth();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing from URL.");
      return;
    }

    const doVerify = async () => {
      try {
        const msg = await verifyEmail(token);
        setStatus("success");
        setMessage(msg);
      } catch (err: any) {
        setStatus("error");
        setMessage(err?.response?.data?.message || "Email verification failed or token has expired.");
      }
    };

    doVerify();
  }, [token, verifyEmail]);

  return (
    <Card className="border-slate-800 bg-[#161b26] shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-base text-slate-100">Email Verification</CardTitle>
        <CardDescription className="text-slate-400">
          Confirming your email address for TeamSync workspace access
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 text-center py-4">
        {status === "loading" && (
          <div className="py-8 flex flex-col items-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-xs text-slate-400">Verifying security token...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-4">
            <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
            <Alert variant="success">{message}</Alert>
            <Button variant="primary" className="w-full" onClick={() => router.push("/login")}>
              Sign In to Account
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-4">
            <XCircle className="h-12 w-12 text-rose-400 mx-auto" />
            <Alert variant="error">{message}</Alert>
            <Button variant="outline" className="w-full" onClick={() => router.push("/login")}>
              Return to Sign In
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-800/60 pt-4 text-xs text-slate-400">
        Need assistance?{" "}
        <Link href="/login" className="ml-1 text-blue-400 font-medium hover:text-blue-300">
          Contact support
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="h-10 w-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Command className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">TeamSync</h1>
          <p className="text-xs text-slate-400">Account Verification</p>
        </div>

        <Suspense fallback={<div className="text-slate-400 text-xs text-center">Loading verification token...</div>}>
          <VerifyEmailContent />
        </Suspense>
      </div>
    </div>
  );
}
