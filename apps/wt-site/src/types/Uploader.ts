export interface Uploader {
  accountId: number;
  email: string;
  banned: boolean;
  created: Date;
  username: string;
  pictures: null;
  permission: Permission;
  profilePicture: string;
}

enum Permission {
  Administrator,
  Moderator,
  User,
}
