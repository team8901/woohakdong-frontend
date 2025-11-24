export type PostNoticeRequest = {
  title: string;
  content: string;
  isPinned: boolean;
};

export type PostNoticeResponse = {
  noticeId: number;
};
