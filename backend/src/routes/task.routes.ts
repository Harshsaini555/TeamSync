import { Router } from "express";
import { taskController } from "../controllers/task.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validateRequest } from "../middlewares/validate.middleware";
import {
  createTaskSchema,
  updateTaskSchema,
  addCommentSchema
} from "../validators/task.validator";

export const projectTaskRouter = Router({ mergeParams: true });
export const taskRouter = Router();

// Routes under /api/v1/projects/:projectId/tasks
projectTaskRouter.use(authenticate);
projectTaskRouter.post("/", validateRequest(createTaskSchema), taskController.createTask);
projectTaskRouter.get("/", taskController.getProjectTasks);

// Direct routes under /api/v1/tasks
taskRouter.use(authenticate);
taskRouter.get("/:taskId", taskController.getTaskById);
taskRouter.patch("/:taskId", validateRequest(updateTaskSchema), taskController.updateTask);
taskRouter.delete("/:taskId", taskController.deleteTask);

// Comments
taskRouter.post("/:taskId/comments", validateRequest(addCommentSchema), taskController.addComment);
taskRouter.get("/:taskId/comments", taskController.getComments);

// Activities
taskRouter.get("/:taskId/activities", taskController.getActivities);
