import { Account } from "./Account";
import { PostTags } from "./PostTags";
import { Uploader } from "./Uploader";

export interface Post {
  pictureId: number;
  accountId: number;
  comments: Comment[];
  created: Date;
  deleted: boolean;
  deletedLogs: null;
  description: string;
  image: string;
  title: string;
  uploader: Uploader | null;
  GPSLat: number;
  GPSLong: number;
  postTags: PostTags[];
}

export interface Comment {
  commentId: number;
  pictureId: number;
  commenterAccountId: number;
  commenter: Account;
  created: Date;
  commentText: string;
  likes: number;
}
