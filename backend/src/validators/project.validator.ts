import { z } from "zod";

export const createProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(50, "Project name cannot exceed 50 characters"),
  key: z
    .string()
    .min(2, "Project key must be at least 2 characters")
    .max(6, "Project key cannot exceed 6 characters")
    .regex(/^[A-Za-z0-9]+$/, "Project key must be alphanumeric (e.g. IOS, CORE)"),
  description: z.string().max(300, "Description cannot exceed 300 characters").optional(),
  color: z.string().optional().default("#3b82f6"),
  leadId: z.string().optional()
});

export const updateProjectSchema = z.object({
  name: z.string().min(2, "Project name must be at least 2 characters").max(50, "Project name cannot exceed 50 characters").optional(),
  description: z.string().max(300, "Description cannot exceed 300 characters").optional(),
  color: z.string().optional(),
  leadId: z.string().optional()
});

export const addProjectMemberSchema = z.object({
  userId: z.string().min(1, "User ID is required")
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
export type AddProjectMemberInput = z.infer<typeof addProjectMemberSchema>;
