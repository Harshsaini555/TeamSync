import { Task } from "./task";
import { Project } from "./project";
import { User } from "./index";

export type SearchCategory = "all" | "tasks" | "projects" | "users" | "comments";

export interface CommentSearchResult {
  _id: string;
  taskId: {
    _id: string;
    taskKey: string;
    title: string;
    projectId: {
      name: string;
      key: string;
      color?: string;
    };
  };
  authorId: {
    name: string;
    email: string;
    avatarUrl?: string;
  };
  content: string;
  createdAt: string;
}

export interface SearchResultsData {
  results: {
    tasks: Task[];
    projects: Project[];
    users: User[];
    comments: CommentSearchResult[];
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasNextPage: boolean;
  };
}
