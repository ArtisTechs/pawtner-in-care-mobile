export interface UserProfile {
  email: string;
  firstName: string;
  id: string;
  lastName: string;
  middleName?: string | null;
  role: string;
  [key: string]: unknown;
}
