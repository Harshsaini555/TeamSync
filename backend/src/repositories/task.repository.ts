import { Task, ITask } from "../models/task.model";
import { Comment, IComment } from "../models/comment.model";
import { ActivityLog, IActivityLog, ActivityAction } from "../models/activity.model";
import { Project } from "../models/project.model";
import mongoose from "mongoose";

export interface TaskFilterOptions {
  status?: string;
  priority?: string;
  assigneeId?: string;
  search?: string;
}

export class TaskRepository {
  public async getNextTaskNumber(projectId: string): Promise<number> {
    const latestTask = await Task.findOne({ projectId }).sort({ taskNumber: -1 }).select("taskNumber");
    return latestTask ? latestTask.taskNumber + 1 : 1;
  }

  public async createTask(taskData: Partial<ITask>): Promise<ITask> {
    const project = await Project.findById(taskData.projectId);
    if (!project) {
      throw new Error("Associated project not found");
    }

    const taskNumber = await this.getNextTaskNumber(project._id.toString());
    const taskKey = `${project.key}-${taskNumber}`;

    const task = new Task({
      ...taskData,
      taskNumber,
      taskKey
    });

    return task.save();
  }

  public async findById(id: string): Promise<ITask | null> {
    return Task.findById(id)
      .populate("assigneeId", "name email avatarUrl")
      .populate("reporterId", "name email avatarUrl")
      .populate("projectId", "name key color");
  }

  public async findByKey(taskKey: string): Promise<ITask | null> {
    return Task.findOne({ taskKey: taskKey.toUpperCase().trim() })
      .populate("assigneeId", "name email avatarUrl")
      .populate("reporterId", "name email avatarUrl")
      .populate("projectId", "name key color");
  }

  public async findByProjectId(projectId: string, filters: TaskFilterOptions = {}): Promise<ITask[]> {
    const query: any = { projectId };

    if (filters.status) {
      query.status = filters.status;
    }

    if (filters.priority) {
      query.priority = filters.priority;
    }

    if (filters.assigneeId) {
      query.assigneeId = filters.assigneeId;
    }

    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { taskKey: { $regex: filters.search, $options: "i" } }
      ];
    }

    return Task.find(query)
      .populate("assigneeId", "name email avatarUrl")
      .populate("reporterId", "name email avatarUrl")
      .populate("projectId", "name key color")
      .sort({ position: 1, createdAt: -1 });
  }

  public async update(id: string, updateData: Partial<ITask>): Promise<ITask | null> {
    return Task.findByIdAndUpdate(id, updateData, { new: true })
      .populate("assigneeId", "name email avatarUrl")
      .populate("reporterId", "name email avatarUrl")
      .populate("projectId", "name key color");
  }

  public async delete(id: string): Promise<boolean> {
    const res = await Task.findByIdAndDelete(id);
    await Comment.deleteMany({ taskId: id });
    await ActivityLog.deleteMany({ taskId: id });
    return !!res;
  }

  // Comment methods
  public async addComment(taskId: string, authorId: string, content: string): Promise<IComment> {
    const comment = new Comment({
      taskId,
      authorId,
      content
    });
    return comment.save();
  }

  public async getComments(taskId: string): Promise<IComment[]> {
    return Comment.find({ taskId })
      .populate("authorId", "name email avatarUrl")
      .sort({ createdAt: 1 });
  }

  // Activity Log methods
  public async logActivity(taskId: string, userId: string, action: ActivityAction, details: string): Promise<IActivityLog> {
    const activity = new ActivityLog({
      taskId,
      userId,
      action,
      details
    });
    return activity.save();
  }

  public async getActivities(taskId: string): Promise<IActivityLog[]> {
    return ActivityLog.find({ taskId })
      .populate("userId", "name email avatarUrl")
      .sort({ createdAt: -1 });
  }
}

export const taskRepository = new TaskRepository();
