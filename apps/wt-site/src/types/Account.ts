import { Role } from "./Role";

export interface Account {
  accountId: number;
  created: Date;
  permission: Role;
  username: string;
  email: string;
  passwordHash: string;
  accessToken: string;
  banned: boolean;
}
