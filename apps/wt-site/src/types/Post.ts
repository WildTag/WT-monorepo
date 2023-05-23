import { Uploader } from "./Uploader";

export interface Post {
  pictureId: number;
  accountId: number;
  comments: null;
  created: Date;
  deleted: boolean;
  deletedLogs: null;
  description: string;
  image: string;
  title: string;
  uploader: Uploader | null;
  GPSLat: number;
  GPSLong: number;
}
