"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerFormSchema, RegisterFormValues } from "@/validators/auth.schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Command, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmitting(true);

    try {
      const msg = await registerUser(data);
      setSuccessMsg(msg);
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Registration failed. Please check inputs.";
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
          <p className="text-xs text-slate-400">Start organizing issues and projects with precision</p>
        </div>

        <Card className="border-slate-800 bg-[#161b26] shadow-2xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base text-slate-100">Create your account</CardTitle>
            <CardDescription className="text-slate-400">
              Set up your profile to start collaborating
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {errorMsg && <Alert variant="error">{errorMsg}</Alert>}
            {successMsg && (
              <Alert variant="success" title="Check your inbox">
                {successMsg}
              </Alert>
            )}

            {!successMsg ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  label="Full Name"
                  placeholder="John Doe"
                  error={errors.name?.message}
                  {...register("name")}
                />

                <Input
                  label="Work Email"
                  type="email"
                  placeholder="name@company.com"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register("email")}
                />

                <Input
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters (1 uppercase, 1 number)"
                  autoComplete="new-password"
                  error={errors.password?.message}
                  {...register("password")}
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  error={errors.confirmPassword?.message}
                  {...register("confirmPassword")}
                />

                <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
                  Create Account
                </Button>
              </form>
            ) : (
              <div className="py-6 text-center space-y-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto" />
                <p className="text-xs text-slate-300">
                  Verification email sent! Click the link in your email to activate your account.
                </p>
                <Button variant="outline" className="w-full" onClick={() => setSuccessMsg(null)}>
                  Back to Registration
                </Button>
              </div>
            )}
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-800/60 pt-4 text-xs text-slate-400">
            Already registered?{" "}
            <Link href="/login" className="ml-1 text-blue-400 font-medium hover:text-blue-300">
              Sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
