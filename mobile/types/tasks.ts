/**
 * Task Management API Response Types
 */

import {
  ApiResponse,
  PaginatedResponse,
  TaskStatus,
  UserProfile,
  BasicUser,
  Timestamp,
} from './common';

/**
 * Task object returned from API
 */
export interface Task {
  task_id: string;
  title: string;
  description?: string;
  location: string;
  status: TaskStatus;
  created_at: Timestamp;
  updated_at?: Timestamp;
}

/**
 * Task taken/assignment object
 */
export interface TaskAssignment {
  taken_task_id: string;
  task_id: string;
  task?: Task;
  user_ids: string[];
  users?: BasicUser[];
  status: TaskStatus;
  start_time: Timestamp;
  end_time: Timestamp | null;
  date: string;
  created_at?: Timestamp;
  updated_at?: Timestamp;
}

/**
 * Task with assignments (Admin view)
 */
export interface TaskWithAssignments extends Task {
  taken_tasks: TaskAssignment[];
}

/**
 * Get all tasks response (Admin)
 */
export interface GetTasksResponse extends PaginatedResponse<Task> {
  data: Task[];
}

/**
 * Get single task response (Admin)
 */
export interface GetTaskResponse extends ApiResponse<Task> {
  task: TaskWithAssignments;
  statistics: TaskStatistics;
}

/**
 * Create task request
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  location: string;
  status?: TaskStatus;
}

/**
 * Create task response
 */
export interface CreateTaskResponse extends ApiResponse<Task> {
  message: string;
  task: Task;
}

/**
 * Update task request
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  location?: string;
  status?: TaskStatus;
}

/**
 * Update task response
 */
export interface UpdateTaskResponse extends ApiResponse<Task> {
  message: string;
  task: Task;
}

/**
 * Delete task response
 */
export interface DeleteTaskResponse extends ApiResponse<null> {
  message: string;
}

/**
 * Assign task request
 */
export interface AssignTaskRequest {
  user_ids: string[];
  start_time: Timestamp;
  date: string;
}

/**
 * Assignment response
 */
export interface AssignmentResponse extends ApiResponse<TaskAssignment> {
  message: string;
  assignment: TaskAssignment;
}

/**
 * Employee: Get my tasks response
 */
export interface GetMyTasksResponse extends ApiResponse<any> {
  tasks: TaskAssignment[];
}

/**
 * Start task response
 */
export interface StartTaskResponse extends ApiResponse<TaskAssignment> {
  message: string;
  assignment: TaskAssignment;
}

/**
 * Complete task response
 */
export interface CompleteTaskResponse extends ApiResponse<TaskAssignment> {
  message: string;
  assignment: TaskAssignment;
}

/**
 * Task statistics
 */
export interface TaskStatistics {
  total_assignments: number;
  completed: number;
  in_progress: number;
  pending: number;
  cancelled?: number;
  completion_rate?: number;
}

/**
 * Get task statistics response
 */
export interface TaskStatisticsResponse extends ApiResponse<TaskStatistics> {
  statistics: TaskStatistics;
}

/**
 * Get assignments response (Admin)
 */
export interface GetAssignmentsResponse extends PaginatedResponse<TaskAssignment> {
  data: TaskAssignment[];
}

/**
 * User assignment statistics
 */
export interface UserAssignmentStatistics {
  total_assignments: number;
  completed: number;
  in_progress: number;
  pending: number;
  completion_rate: number;
  average_completion_time_hours?: number;
}

/**
 * Get user assignments response
 */
export interface GetUserAssignmentsResponse extends ApiResponse<any> {
  user: BasicUser;
  statistics: UserAssignmentStatistics;
}

/**
 * Task location count
 */
export interface TaskLocationCount {
  location: string;
  count: number;
}

/**
 * Get tasks by location response
 */
export interface GetTasksByLocationResponse extends ApiResponse<any> {
  locations: TaskLocationCount[];
}
