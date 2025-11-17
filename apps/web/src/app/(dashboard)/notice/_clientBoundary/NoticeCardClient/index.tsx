'use client';

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
import { useRouter } from 'next/navigation';

import { type Notice } from '../../_helpers/types';

type props = {
  notice: Notice;
};

export const NoticeCardClient = ({ notice }: props) => {
  const router = useRouter();

  const handleCardClick = (e: React.MouseEvent) => {
    // 드롭다운 메뉴 클릭 시에는 페이지 이동하지 않음
    if (
      (e.target as HTMLElement).closest('[role="menu"]') ||
      (e.target as HTMLElement).closest('button')
    ) {
      return;
    }

    router.push(`/notice/${notice.id}`);
  };

  return (
    <Card
      className="hover:bg-muted cursor-pointer gap-4 transition-colors"
      onClick={handleCardClick}>
      {notice.isPinned && (
        <Badge className="bg-primary/15 text-primary ml-6">
          <PinIcon />
          고정됨
        </Badge>
      )}

      <CardHeader className="flex flex-row">
        <div className="flex-1 flex-col space-y-1">
          <CardTitle className="line-clamp-2">{notice.title}</CardTitle>
          <CardDescription className="text-muted-foreground flex items-center gap-2">
            <p>{notice.updatedAt}</p>
            <p>{notice.writer} 작성</p>
          </CardDescription>
        </div>

        {/** @todo 공지사항 고정, 수정, 삭제 기능 연동해야 함, 임원진만 보일 수 있게 해야 함*/}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
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
        <div className="prose line-clamp-3 max-w-none md:line-clamp-4">
          <p className="whitespace-pre-wrap">{notice.content}</p>
        </div>
      </CardContent>
    </Card>
  );
};
