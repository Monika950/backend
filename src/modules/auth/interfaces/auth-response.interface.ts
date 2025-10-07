import { SafeUser } from './safe-user.interface';

export interface AuthResponse extends SafeUser {
  accessToken: string;
  refreshToken: string;
}
