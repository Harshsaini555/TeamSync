"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordFormSchema, ResetPasswordFormValues } from "@/validators/auth.schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Command, CheckCircle, ArrowRight } from "lucide-react";

function ResetPasswordFormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const { resetPassword } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setErrorMsg("Reset token is missing from the URL.");
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const msg = await resetPassword(token, data);
      setSuccessMsg(msg);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Password reset failed. The token may be expired.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-slate-800 bg-[#161b26] shadow-2xl">
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-base text-slate-100">Set New Password</CardTitle>
        <CardDescription className="text-slate-400">
          Enter a strong new password for your TeamSync account
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
        {successMsg && (
          <Alert variant="success" title="Password Reset Complete">
            {successMsg} Redirecting to login...
          </Alert>
        )}

        {!successMsg ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error={errors.newPassword?.message}
              {...register("newPassword")}
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword")}
            />

            <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
              Reset Password
            </Button>
          </form>
        ) : (
          <div className="py-4 text-center space-y-3">
            <CheckCircle className="h-10 w-10 text-emerald-400 mx-auto" />
            <Button variant="primary" className="w-full" onClick={() => router.push("/login")}>
              Go to Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>

      <CardFooter className="justify-center border-t border-slate-800/60 pt-4 text-xs text-slate-400">
        <Link href="/login" className="text-blue-400 font-medium hover:text-blue-300">
          Return to Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="h-10 w-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Command className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">TeamSync</h1>
          <p className="text-xs text-slate-400">Security Credentials</p>
        </div>

        <Suspense fallback={<div className="text-slate-400 text-xs text-center">Loading reset parameters...</div>}>
          <ResetPasswordFormContent />
        </Suspense>
      </div>
    </div>
  );
}
