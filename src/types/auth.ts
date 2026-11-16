export interface UserProfile {
  id: number;
  name: string;
  email: string;
  role: string;
  [key: string]: unknown;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
  profile?: UserProfile;
}

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export interface FormErrors {
  email?: string;
  password?: string;
}

export type AlertType = "error" | "success";

export interface AlertState {
  type: AlertType;
  message: string;
}
