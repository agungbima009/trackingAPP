/**
 * Location Tracking API Response Types
 */

import {
  ApiResponse,
  PaginatedResponse,
  TrackingStatus,
  BasicUser,
  Timestamp,
  LocationPoint,
  Coordinate,
} from './common';
import { Task, TaskAssignment } from './tasks';

/**
 * Location record object
 */
export interface Location extends Coordinate {
  location_id: string;
  taken_task_id: string;
  user_id: string;
  address?: string;
  tracking_status: TrackingStatus;
  recorded_at: Timestamp;
  updated_at?: Timestamp;
}

/**
 * Location with task and user details
 */
export interface LocationWithDetails extends Location {
  taken_task?: TaskAssignment & {
    task?: Task;
  };
  user?: BasicUser;
}

/**
 * Record location request
 */
export interface RecordLocationRequest {
  taken_task_id: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  address?: string;
  tracking_status?: TrackingStatus;
}

/**
 * Record location response
 */
export interface RecordLocationResponse extends ApiResponse<Location> {
  message: string;
  location: Location;
}

/**
 * Batch location in request
 */
export interface BatchLocationRequest extends RecordLocationRequest {
  recorded_at?: Timestamp;
}

/**
 * Batch record locations request
 */
export interface RecordBatchLocationsRequest {
  locations: BatchLocationRequest[];
}

/**
 * Batch record locations response
 */
export interface RecordBatchLocationsResponse extends ApiResponse<Location[]> {
  message: string;
  locations: Location[];
}

/**
 * Get my locations response
 */
export interface GetMyLocationsResponse
  extends PaginatedResponse<LocationWithDetails> {
  data: LocationWithDetails[];
}

/**
 * Get task locations response
 */
export interface GetTaskLocationsResponse extends ApiResponse<Location[]> {
  data: LocationWithDetails[];
}

/**
 * Route point in path
 */
export interface RoutePoint {
  latitude: number;
  longitude: number;
  recorded_at: Timestamp;
}

/**
 * Route statistics
 */
export interface RouteStatistics {
  total_points: number;
  duration_hours: number;
  start_time: Timestamp;
  end_time: Timestamp;
  distance_km?: number;
}

/**
 * Get route/path response
 */
export interface GetRouteResponse extends ApiResponse<any> {
  route: RoutePoint[];
  statistics: RouteStatistics;
}

/**
 * Location statistics object
 */
export interface LocationStatistics {
  total_locations: number;
  total_tasks: number;
  auto_tracked: number;
  manual_tracked: number;
  average_accuracy: number;
  date_range?: {
    start: string;
    end: string;
  };
}

/**
 * Get location statistics response
 */
export interface LocationStatisticsResponse extends ApiResponse<any> {
  statistics: LocationStatistics;
}

/**
 * Current location for task (with user)
 */
export interface CurrentLocation {
  user: BasicUser;
  location: Coordinate & {
    recorded_at: Timestamp;
  };
}

/**
 * Get current locations response
 */
export interface GetCurrentLocationsResponse extends ApiResponse<any> {
  current_locations: CurrentLocation[];
}

/**
 * Task location statistics
 */
export interface TaskLocationStatistics {
  total_locations: number;
  users_tracking: number;
  duration_hours: number;
  average_accuracy: number;
  first_location: Timestamp;
  latest_location: Timestamp;
}

/**
 * Get task location statistics response
 */
export interface GetTaskLocationStatisticsResponse extends ApiResponse<any> {
  statistics: TaskLocationStatistics;
}

/**
 * User location statistics (Admin)
 */
export interface UserLocationStatistics {
  total_locations: number;
  total_tasks: number;
  auto_tracked: number;
  manual_tracked: number;
  average_accuracy: number;
}

/**
 * Get user location statistics response
 */
export interface GetUserLocationStatisticsResponse extends ApiResponse<any> {
  user: BasicUser;
  statistics: UserLocationStatistics;
}

/**
 * Nearby location
 */
export interface NearbyLocation extends LocationWithDetails {
  distance_km: number;
}

/**
 * Get nearby locations response
 */
export interface GetNearbyLocationsResponse extends ApiResponse<any> {
  locations: NearbyLocation[];
}

/**
 * Delete location response
 */
export interface DeleteLocationResponse extends ApiResponse<null> {
  message: string;
}

/**
 * Location tracking state
 */
export interface LocationTrackingState {
  isTracking: boolean;
  currentTask: string | null;
  lastLocation: Location | null;
  locations: Location[];
  error: string | null;
}
