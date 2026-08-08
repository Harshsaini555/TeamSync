import { taskRepository, TaskRepository, TaskFilterOptions } from "../repositories/task.repository";
import { projectRepository } from "../repositories/project.repository";
import { userRepository } from "../repositories/user.repository";
import { ActivityAction } from "../models/activity.model";
import { NotificationType } from "../models/notification.model";
import { notificationService } from "./notification.service";
import { socketService } from "./socket.service";
import { CreateTaskInput, UpdateTaskInput } from "../validators/task.validator";
import { NotFoundError } from "../errors/app-error";
import { Comment as CommentModel } from "../models/comment.model";
import mongoose from "mongoose";

export class TaskService {
  private repo: TaskRepository;

  constructor() {
    this.repo = taskRepository;
  }

  public async createTask(projectId: string, reporterUserId: string, input: CreateTaskInput) {
    const project = await projectRepository.findById(projectId);
    if (!project) {
      throw new NotFoundError("Project not found");
    }

    const taskData: any = {
      projectId: new mongoose.Types.ObjectId(projectId),
      workspaceId: project.workspaceId,
      title: input.title,
      description: input.description || "",
      status: input.status,
      priority: input.priority,
      labels: input.labels || [],
      reporterId: new mongoose.Types.ObjectId(reporterUserId),
      estimatedTime: input.estimatedTime || 0,
      checklist: input.checklist || [],
      subtasks: input.subtasks || []
    };

    if (input.assigneeId) {
      taskData.assigneeId = new mongoose.Types.ObjectId(input.assigneeId);
    }

    if (input.dueDate) {
      taskData.dueDate = new Date(input.dueDate);
    }

    const task = await this.repo.createTask(taskData);

    await this.repo.logActivity(
      task._id.toString(),
      reporterUserId,
      ActivityAction.TASK_CREATED,
      `created task ${task.taskKey}`
    );

    const fullTask = await this.repo.findById(task._id.toString());

    // Broadcast TASK_UPDATED to project room
    socketService.emitToProject(projectId, "TASK_UPDATED", fullTask);

    // If assigned to another user, send notification
    if (input.assigneeId && input.assigneeId !== reporterUserId) {
      await notificationService.createNotification(
        reporterUserId,
        input.assigneeId,
        NotificationType.TASK_ASSIGNED,
        "New Task Assigned",
        `You were assigned to issue ${task.taskKey}: "${task.title}"`
      );
    }

    return fullTask;
  }

  public async getProjectTasks(projectId: string, filters: TaskFilterOptions = {}) {
    return this.repo.findByProjectId(projectId, filters);
  }

  public async getTaskById(taskId: string) {
    const task = await this.repo.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    return task;
  }

  public async updateTask(taskId: string, userId: string, input: UpdateTaskInput) {
    const existingTask = await this.repo.findById(taskId);
    if (!existingTask) {
      throw new NotFoundError("Task not found");
    }

    const updateData: any = { ...input };

    if (input.assigneeId !== undefined) {
      updateData.assigneeId = input.assigneeId ? new mongoose.Types.ObjectId(input.assigneeId) : null;
    }

    if (input.dueDate !== undefined) {
      updateData.dueDate = input.dueDate ? new Date(input.dueDate) : null;
    }

    const updatedTask = await this.repo.update(taskId, updateData);
    if (!updatedTask) {
      throw new NotFoundError("Task not found");
    }

    const projectIdStr = updatedTask.projectId._id.toString();

    // Broadcast TASK_UPDATED live to room
    socketService.emitToProject(projectIdStr, "TASK_UPDATED", updatedTask);

    // Log Activity Changes & Send Realtime Notifications
    if (input.status && input.status !== existingTask.status) {
      await this.repo.logActivity(
        taskId,
        userId,
        ActivityAction.STATUS_CHANGED,
        `changed status from ${existingTask.status} to ${input.status}`
      );
    }

    if (input.priority && input.priority !== existingTask.priority) {
      await this.repo.logActivity(
        taskId,
        userId,
        ActivityAction.PRIORITY_CHANGED,
        `changed priority from ${existingTask.priority} to ${input.priority}`
      );
    }

    if (input.assigneeId !== undefined && String(input.assigneeId) !== String(existingTask.assigneeId?._id || "")) {
      await this.repo.logActivity(
        taskId,
        userId,
        ActivityAction.ASSIGNEE_CHANGED,
        input.assigneeId ? "reassigned the task" : "unassigned the task"
      );

      if (input.assigneeId) {
        await notificationService.createNotification(
          userId,
          input.assigneeId,
          NotificationType.TASK_ASSIGNED,
          "Task Assigned",
          `You were assigned to ${updatedTask.taskKey}: "${updatedTask.title}"`
        );
      }
    }

    return updatedTask;
  }

  public async deleteTask(taskId: string) {
    const task = await this.repo.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }
    const projectIdStr = task.projectId._id.toString();
    const res = await this.repo.delete(taskId);

    socketService.emitToProject(projectIdStr, "TASK_DELETED", { taskId });
    return res;
  }

  public async addComment(taskId: string, authorUserId: string, content: string) {
    const task = await this.repo.findById(taskId);
    if (!task) {
      throw new NotFoundError("Task not found");
    }

    const comment = await this.repo.addComment(taskId, authorUserId, content);
    await this.repo.logActivity(taskId, authorUserId, ActivityAction.COMMENT_ADDED, "added a comment");

    const populatedComment = await CommentModel.findById(comment._id).populate("authorId", "name email avatarUrl");

    const projectIdStr = task.projectId._id.toString();
    socketService.emitToProject(projectIdStr, "COMMENT_ADDED", { taskId, comment: populatedComment });

    // Notify assignee if someone else comments
    if (task.assigneeId && task.assigneeId._id.toString() !== authorUserId) {
      await notificationService.createNotification(
        authorUserId,
        task.assigneeId._id.toString(),
        NotificationType.COMMENT_ADDED,
        "New Comment",
        `New comment on ${task.taskKey}: "${content.slice(0, 60)}..."`
      );
    }

    // Mention parsing: @email or @name
    const mentions = content.match(/@([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/g);
    if (mentions) {
      for (const mention of mentions) {
        const cleanEmail = mention.replace("@", "");
        const mentionedUser = await userRepository.findByEmail(cleanEmail);
        if (mentionedUser) {
          await notificationService.createNotification(
            authorUserId,
            mentionedUser._id.toString(),
            NotificationType.USER_MENTIONED,
            "You were mentioned",
            `You were mentioned in a comment on ${task.taskKey}`
          );
        }
      }
    }

    return populatedComment;
  }

  public async getComments(taskId: string) {
    return this.repo.getComments(taskId);
  }

  public async getActivities(taskId: string) {
    return this.repo.getActivities(taskId);
  }
}

export const taskService = new TaskService();
