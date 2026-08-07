"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordFormSchema, ForgotPasswordFormValues } from "@/validators/auth.schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Command, ArrowLeft, MailCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const { forgotPassword } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: ""
    }
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const msg = await forgotPassword(data);
      setSuccessMsg(msg);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to process request.";
      setErrorMsg(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="h-10 w-10 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Command className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-100">TeamSync</h1>
          <p className="text-xs text-slate-400">Account Recovery</p>
        </div>

        <Card className="border-slate-800 bg-[#161b26] shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base text-slate-100">Forgot Password</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your email address and we will send you a password reset link
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
            {successMsg && (
              <Alert variant="success" title="Instructions Sent">
                {successMsg}
              </Alert>
            )}

            {!successMsg ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Work Email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                  Send Reset Link
                </Button>
              </form>
            ) : (
              <div className="py-4 text-center space-y-3">
                <MailCheck className="h-10 w-10 text-amber-400 mx-auto" />
                <p className="text-xs text-slate-300">
                  Please check your inbox. Click the link inside the email to set a new password.
                </p>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-800/60 pt-4 text-xs text-slate-400">
            <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-slate-200">
              <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
