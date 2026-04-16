export interface UserRegisterFormData {
  name: string;
  lastname: string;
  email: string;
  password: string;
  confirmPassword: string;
  termsAndConditions: boolean;
}

export interface UserRegisterData {
  name: string;
  lastName: string;
  email: string;
  password: string;
}

export interface UserSearchEmailResult {
  id: string;
  email: string;
  name: string;
  avatar: string;
}

export interface UserRole {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface UserRoleRequest {
  userId: string;
  role: string;
}