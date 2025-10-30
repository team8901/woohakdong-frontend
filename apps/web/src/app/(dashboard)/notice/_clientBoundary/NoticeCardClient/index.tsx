import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { MoreVerticalIcon, PinIcon } from 'lucide-react';

type Notice = {
  id: number;
  isPinned: boolean;
  title: string;
  updatedAt: string;
  writer: string;
  content: string;
};

type NoticeCardClientProps = {
  notice: Notice;
};

export const NoticeCardClient = ({ notice }: NoticeCardClientProps) => {
  return (
    <Card className="hover:bg-muted gap-4 transition-colors">
      {notice.isPinned && (
        <Badge variant="secondary" className="bg-primary/15 text-primary ml-6">
          <PinIcon />
          고정됨
        </Badge>
      )}

      <CardHeader className="flex flex-row">
        <div className="flex-1">
          <CardTitle>{notice.title}</CardTitle>
          <CardDescription className="text-muted-foreground flex items-center gap-2">
            <p>{notice.updatedAt}</p>
            <p>{notice.writer} 작성</p>
          </CardDescription>
        </div>

        {/** @todo 공지사항 고정, 수정, 삭제 기능 연동해야 함, 임원진만 보일 수 있게 해야 함*/}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <MoreVerticalIcon className="h-4 w-4" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>고정</DropdownMenuItem>
            <DropdownMenuItem>수정</DropdownMenuItem>
            <DropdownMenuItem>삭제</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <CardContent>
        <p className="text-pretty">{notice.content}</p>
      </CardContent>
    </Card>
  );
};
