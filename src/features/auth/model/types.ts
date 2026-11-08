export interface User {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role?: string;
  roles?: string[];
}

export interface GoogleAuthRequest {
  token: string;
}

export interface EmailLoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string; // JWT propio emitido por servicio-iam
  user: User;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setAuth: (token: string, user: User) => void;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}
