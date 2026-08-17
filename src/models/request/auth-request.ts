/** POST /auth/session — first factor: password. */
export interface LoginRequest {
  email: string;
  password: string;
  /** Extends the session cookie beyond the working day. */
  remember: boolean;
}

/** POST /auth/session/mfa — second factor, exchanged for a full session. */
export interface MfaRequest {
  /** 6-digit code from a security key or authenticator app. */
  code: string;
}

/** POST /auth/password/forgot — send a reset link to a named account. */
export interface ForgotPasswordRequest {
  email: string;
}

/** POST /auth/password/reset — set a new password from a emailed token. */
export interface ResetPasswordRequest {
  token: string;
  password: string;
  confirmPassword: string;
}
