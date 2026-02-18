/**
 * Authentication API Response Types
 */

import {
  ApiResponse,
  UserProfile,
  BasicUser,
  Permission,
  Role,
  Timestamp,
} from './common';

/**
 * Login request body
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Register request body
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

/**
 * Auth token response
 */
export interface TokenData {
  token: string;
  token_type: 'Bearer';
}

/**
 * Login/Register response
 */
export interface AuthResponse extends ApiResponse<any> {
  message: string;
  user: UserProfile;
  token: string;
  token_type: 'Bearer';
}

/**
 * Get current user response
 */
export interface CurrentUserResponse extends ApiResponse<UserProfile> {
  user: UserProfile;
}

/**
 * Generic auth message response (logout, etc.)
 */
export interface AuthMessageResponse extends ApiResponse<any> {
  message: string;
}

/**
 * Refresh token response
 */
export interface RefreshTokenResponse extends ApiResponse<TokenData> {
  message: string;
  token: string;
  token_type: 'Bearer';
}

/**
 * Logout all devices response
 */
export interface LogoutAllResponse extends ApiResponse<any> {
  message: string;
}

/**
 * User stored in AsyncStorage after login
 */
export interface StoredUser {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
  department?: string;
  position?: string;
}

/**
 * Auth state in the app
 */
export interface AuthState {
  isAuthenticated: boolean;
  user: StoredUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}
