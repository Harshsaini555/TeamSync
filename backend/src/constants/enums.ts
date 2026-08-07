export enum UserRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  GUEST = "GUEST"
}

export enum AuthProvider {
  LOCAL = "LOCAL",
  GOOGLE = "GOOGLE"
}

export enum TokenType {
  ACCESS = "ACCESS",
  REFRESH = "REFRESH",
  VERIFICATION = "VERIFICATION",
  PASSWORD_RESET = "PASSWORD_RESET"
}

export enum TaskStatus {
  BACKLOG = "BACKLOG",
  TODO = "TODO",
  IN_PROGRESS = "IN_PROGRESS",
  IN_REVIEW = "IN_REVIEW",
  DONE = "DONE",
  CANCELED = "CANCELED"
}

export enum TaskPriority {
  LOW = "LOW",
  MEDIUM = "MEDIUM",
  HIGH = "HIGH",
  URGENT = "URGENT"
}
