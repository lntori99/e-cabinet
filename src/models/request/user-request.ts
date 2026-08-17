import type { CabinetUser, UserRole } from "@/models/response/base-response";

/** POST /users — enrol a named account. Shared accounts are prohibited. */
export interface CreateUserRequest {
  name: string;
  role: UserRole;
  ministry: string;
  mfa: CabinetUser["mfa"];
  device: CabinetUser["device"];
}

/** PATCH /users/{userId}/status — suspend or reactivate a named account. */
export interface UpdateUserStatusRequest {
  userId: string;
  status: CabinetUser["status"];
}
