export interface Uploader {
  accountId: number;
  email: string;
  banned: boolean;
  created: Date;
  username: string;
  pictures: null;
  permission: Permission;
  profileImage: string;
}

enum Permission {
  ADMINISTRATOR,
  Moderator,
  User,
}
