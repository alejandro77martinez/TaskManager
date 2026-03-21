export interface AuthUser {
  id?: string;
  name: string;
  lastName: string;
  email: string;
  roles: string[];
}

export interface LoginData {
  email: string;
  password: string;
}
