import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "info";
  title?: string;
}

export const Alert: React.FC<AlertProps> = ({ className, variant = "error", title, children, ...props }) => {
  const styles = {
    error: "bg-rose-950/40 border-rose-800/60 text-rose-300",
    success: "bg-emerald-950/40 border-emerald-800/60 text-emerald-300",
    info: "bg-sky-950/40 border-sky-800/60 text-sky-300"
  };

  const icons = {
    error: AlertCircle,
    success: CheckCircle2,
    info: Info
  };

  const IconComponent = icons[variant];

  return (
    <div
      role="alert"
      className={cn("flex items-start space-x-3 rounded-md border p-3 text-xs leading-relaxed", styles[variant], className)}
      {...props}
    >
      <IconComponent className="h-4 w-4 shrink-0 mt-0.5" />
      <div className="space-y-0.5">
        {title && <h5 className="font-semibold text-current">{title}</h5>}
        <div>{children}</div>
      </div>
    </div>
  );
};
