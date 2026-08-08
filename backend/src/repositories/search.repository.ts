import { Task } from "../models/task.model";
import { Project } from "../models/project.model";
import { Comment } from "../models/comment.model";
import { WorkspaceMember } from "../models/workspace-member.model";
import { User } from "../models/user.model";
import mongoose from "mongoose";

export interface SearchOptions {
  q: string;
  type?: "all" | "tasks" | "projects" | "users" | "comments";
  page?: number;
  limit?: number;
}

export class SearchRepository {
  public async searchAll(workspaceId: string, options: SearchOptions) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);
    const q = options.q.trim();
    const regex = new RegExp(q, "i");

    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 10));
    const skip = (page - 1) * limit;

    const targetType = options.type || "all";

    let tasks: any[] = [];
    let projects: any[] = [];
    let users: any[] = [];
    let comments: any[] = [];

    let totalTasks = 0;
    let totalProjects = 0;
    let totalUsers = 0;
    let totalComments = 0;

    // Search Projects
    if (targetType === "all" || targetType === "projects") {
      const projectQuery = {
        workspaceId: wsId,
        $or: [{ name: regex }, { key: regex }, { description: regex }]
      };
      totalProjects = await Project.countDocuments(projectQuery);
      projects = await Project.find(projectQuery)
        .populate("leadId", "name email avatarUrl")
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 });
    }

    // Search Tasks
    if (targetType === "all" || targetType === "tasks") {
      const taskQuery = {
        workspaceId: wsId,
        $or: [{ title: regex }, { taskKey: regex }, { description: regex }, { labels: regex }]
      };
      totalTasks = await Task.countDocuments(taskQuery);
      tasks = await Task.find(taskQuery)
        .populate("assigneeId", "name email avatarUrl")
        .populate("projectId", "name key color")
        .skip(skip)
        .limit(limit)
        .sort({ updatedAt: -1 });
    }

    // Search Users (Workspace Members)
    if (targetType === "all" || targetType === "users") {
      const memberUserIds = (await WorkspaceMember.find({ workspaceId: wsId }).select("userId")).map(
        (m) => m.userId
      );
      const userQuery = {
        _id: { $in: memberUserIds },
        $or: [{ name: regex }, { email: regex }]
      };
      totalUsers = await User.countDocuments(userQuery);
      users = await User.find(userQuery).select("name email avatarUrl role").skip(skip).limit(limit);
    }

    // Search Comments
    if (targetType === "all" || targetType === "comments") {
      const wsTaskIds = (await Task.find({ workspaceId: wsId }).select("_id")).map((t) => t._id);
      const commentQuery = {
        taskId: { $in: wsTaskIds },
        content: regex
      };
      totalComments = await Comment.countDocuments(commentQuery);
      comments = await Comment.find(commentQuery)
        .populate("authorId", "name email avatarUrl")
        .populate({
          path: "taskId",
          select: "taskKey title projectId",
          populate: { path: "projectId", select: "name key color" }
        })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    const totalResults = totalTasks + totalProjects + totalUsers + totalComments;
    const hasNextPage = skip + limit < totalResults;

    return {
      results: {
        tasks,
        projects,
        users,
        comments
      },
      pagination: {
        page,
        limit,
        total: totalResults,
        hasNextPage
      }
    };
  }
}

export const searchRepository = new SearchRepository();
