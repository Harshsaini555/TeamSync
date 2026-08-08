import { Task } from "../models/task.model";
import { Project } from "../models/project.model";
import { WorkspaceMember } from "../models/workspace-member.model";
import { ActivityLog } from "../models/activity.model";
import mongoose from "mongoose";

export class DashboardRepository {
  public async getDashboardData(workspaceId: string) {
    const wsId = new mongoose.Types.ObjectId(workspaceId);

    // 1. Overview Cards & Aggregation
    const totalProjects = await Project.countDocuments({ workspaceId: wsId, isArchived: false });
    const totalTasks = await Task.countDocuments({ workspaceId: wsId });
    const completedTasks = await Task.countDocuments({ workspaceId: wsId, status: "DONE" });
    const activeMembers = await WorkspaceMember.countDocuments({ workspaceId: wsId });

    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // 2. Task Distribution Aggregation
    const taskDistributionRaw = await Task.aggregate([
      { $match: { workspaceId: wsId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const taskDistribution = {
      BACKLOG: 0,
      TODO: 0,
      IN_PROGRESS: 0,
      IN_REVIEW: 0,
      DONE: 0,
      CANCELED: 0
    };
    taskDistributionRaw.forEach((item) => {
      if (item._id in taskDistribution) {
        (taskDistribution as any)[item._id] = item.count;
      }
    });

    // 3. Priority Distribution Aggregation
    const priorityDistributionRaw = await Task.aggregate([
      { $match: { workspaceId: wsId } },
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    const priorityDistribution = {
      URGENT: 0,
      HIGH: 0,
      MEDIUM: 0,
      LOW: 0
    };
    priorityDistributionRaw.forEach((item) => {
      if (item._id in priorityDistribution) {
        (priorityDistribution as any)[item._id] = item.count;
      }
    });

    // 4. Project Progress Aggregation
    const projects = await Project.find({ workspaceId: wsId, isArchived: false }).select("name key color");

    const projectProgress = await Promise.all(
      projects.map(async (p) => {
        const pTotal = await Task.countDocuments({ projectId: p._id });
        const pCompleted = await Task.countDocuments({ projectId: p._id, status: "DONE" });
        const pPercentage = pTotal > 0 ? Math.round((pCompleted / pTotal) * 100) : 0;

        return {
          projectId: p._id.toString(),
          name: p.name,
          key: p.key,
          color: p.color || "#3b82f6",
          totalTasks: pTotal,
          completedTasks: pCompleted,
          completionPercentage: pPercentage
        };
      })
    );

    // 5. Upcoming Deadlines (Next 7 days, non-completed tasks)
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const upcomingDeadlines = await Task.find({
      workspaceId: wsId,
      status: { $ne: "DONE" },
      dueDate: { $gte: now, $lte: next7Days }
    })
      .populate("assigneeId", "name email avatarUrl")
      .populate("projectId", "name key color")
      .sort({ dueDate: 1 })
      .limit(6);

    // 6. Recent Activity Stream
    const projectIds = projects.map((p) => p._id);
    const taskIds = (await Task.find({ projectId: { $in: projectIds } }).select("_id")).map((t) => t._id);

    const recentActivity = await ActivityLog.find({ taskId: { $in: taskIds } })
      .populate("userId", "name email avatarUrl")
      .populate("taskId", "taskKey title")
      .sort({ createdAt: -1 })
      .limit(10);

    return {
      overview: {
        totalProjects,
        totalTasks,
        completedTasks,
        completionPercentage,
        activeMembers
      },
      taskDistribution,
      priorityDistribution,
      projectProgress,
      upcomingDeadlines,
      recentActivity
    };
  }
}

export const dashboardRepository = new DashboardRepository();
