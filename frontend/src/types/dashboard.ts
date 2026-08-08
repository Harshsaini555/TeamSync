import { Task } from "./task";

export interface OverviewMetrics {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
  activeMembers: number;
}

export interface TaskDistribution {
  BACKLOG: number;
  TODO: number;
  IN_PROGRESS: number;
  IN_REVIEW: number;
  DONE: number;
  CANCELED: number;
}

export interface PriorityDistribution {
  URGENT: number;
  HIGH: number;
  MEDIUM: number;
  LOW: number;
}

export interface ProjectProgressItem {
  projectId: string;
  name: string;
  key: string;
  color: string;
  totalTasks: number;
  completedTasks: number;
  completionPercentage: number;
}

export interface RecentActivityItem {
  _id: string;
  userId: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  taskId: {
    taskKey: string;
    title: string;
  };
  action: string;
  details: string;
  createdAt: string;
}

export interface DashboardData {
  overview: OverviewMetrics;
  taskDistribution: TaskDistribution;
  priorityDistribution: PriorityDistribution;
  projectProgress: ProjectProgressItem[];
  upcomingDeadlines: Task[];
  recentActivity: RecentActivityItem[];
}
