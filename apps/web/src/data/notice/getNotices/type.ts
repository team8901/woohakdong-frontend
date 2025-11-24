export type GetNoticesResponse = {
  data: {
    id: number;
    isPinned: boolean;
    title: string;
    updatedAt: string;
    writer: string;
    content: string;
  }[];
};
