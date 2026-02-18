/**
 * Common Types used across the API
 */

/**
 * Pagination metadata for list endpoints
 */
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total: number;
  last_page?: number;
}

/**
 * Paginated response wrapper
 */
export interface PaginatedResponse<T> extends PaginationMeta {
  data: T[];
}

/**
 * Standard API error response
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

/**
 * Standard success response wrapper
 */
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  [key: string]: any;
}

/**
 * User role object
 */
export interface Role {
  id: string;
  name: string;
  permissions?: Permission[];
}

/**
 * User permission object
 */
export interface Permission {
  id?: string;
  name: string;
}

/**
 * Basic user information
 */
export interface BasicUser {
  id: string;
  name: string;
  email: string;
}

/**
 * Full user profile with roles and permissions
 */
export interface UserProfile extends BasicUser {
  phone_number?: string;
  department?: string;
  position?: string;
  address?: string;
  avatar?: string | null;
  status?: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
  roles?: Role[];
  permissions?: Permission[];
}

/**
 * Timestamp response in ISO format
 */
export type Timestamp = string;

/**
 * Date string in Y-m-d format
 */
export type DateString = string;

/**
 * Status enums
 */
export enum TaskStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum TrackingStatus {
  AUTO = 'auto',
  MANUAL = 'manual',
}

/**
 * GPS Coordinate
 */
export interface Coordinate {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Timestamp;
}

/**
 * Generic location point with timestamp
 */
export interface LocationPoint extends Coordinate {
  recorded_at: Timestamp;
  address?: string;
}
