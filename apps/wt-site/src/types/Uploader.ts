export interface Uploader {
  accountId: number;
  email: string;
  banned: boolean;
  created: Date;
  username: string;
  pictures: null;
  permission: Permission;
}

enum Permission {
  Administrator,
  Moderator,
  User,
}
