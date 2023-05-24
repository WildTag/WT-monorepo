export enum LogType {
  BAN_ACCOUNT = "BAN_ACCOUNT",
  UNBAN_ACCOUNT = "UNBAN_ACCOUNT",
  EDIT_ACCOUNT = "EDIT_ACCOUNT",
  EDIT_COMMENT = "EDIT_COMMENT",
  DELETE_COMMENT = "DELETE_COMMENT",
  POST_EDIT = "POST_EDIT",
  POST_DELETE = "POST_DELETE",
}

export interface AdminLog {
  id: number;
  performedByUserId: number;
  datetime: Date;
  type: LogType;
  pictureId: number | null;
  accountId: number | null;
}
