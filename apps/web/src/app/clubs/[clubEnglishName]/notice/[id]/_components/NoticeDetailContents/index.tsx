import { type NoticeResponse } from '@workspace/api/generated';
import { Badge } from '@workspace/ui/components/badge';
import { PinIcon } from 'lucide-react';

type Props = {
  notice: NoticeResponse;
};

export const NoticeDetailContents = ({ notice }: Props) => {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full max-w-3xl flex-col space-y-6">
        <div className="flex w-full flex-col space-y-3">
          {notice.isPinned && (
            <Badge className="bg-primary/15 text-primary" size="lg">
              <PinIcon />
              고정됨
            </Badge>
          )}

          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {notice.title}
          </h1>

          <div className="text-muted-foreground flex items-center gap-2">
            <p>{notice.updatedAt}</p>
            <p>{notice.writer} 작성</p>
          </div>
        </div>

        <div className="prose w-full max-w-none text-lg">
          <p className="whitespace-pre-wrap leading-relaxed">
            {notice.content}
          </p>
        </div>
      </div>
    </div>
  );
};
