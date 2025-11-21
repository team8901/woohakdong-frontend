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
import type { LucideIcon } from 'lucide-react';
import {
  BeerIcon,
  CalendarIcon,
  CircleEllipsisIcon,
  FlameKindlingIcon,
  LampDeskIcon,
  MoreVerticalIcon,
  PresentationIcon,
  UsersIcon,
} from 'lucide-react';
import Image from 'next/image';

import { type Activity } from '../../_helpers/types';

type Props = {
  activity: Activity;
};

const tagIconMap: Record<string, LucideIcon> = {
  스터디: LampDeskIcon,
  회식: BeerIcon,
  회의: PresentationIcon,
  기타: CircleEllipsisIcon,
  MT: FlameKindlingIcon,
};

export const ActivityCardClient = ({ activity }: Props) => {
  const TagIcon = tagIconMap[activity.tag] ?? CircleEllipsisIcon;

  return (
    <Card
      className="hover:bg-muted cursor-pointer gap-4 transition-colors"
      onClick={() => {}}>
      <CardHeader className="flex flex-row">
        <div className="flex-1 flex-col space-y-1">
          <CardTitle className="line-clamp-2">{activity.title}</CardTitle>
          <CardDescription className="text-muted-foreground flex items-center gap-2">
            <p>{activity.createdAt}</p>
            <p>{activity.writer} 작성</p>
          </CardDescription>
        </div>

        {/** @todo 활동기록 수정, 삭제 기능 연동해야 함, 임원진만 보일 수 있게 해야 함*/}
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button size="icon" variant="ghost" className="h-6 w-6">
              <MoreVerticalIcon className="h-4 w-4" />
              <span className="sr-only">메뉴 열기</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>수정</DropdownMenuItem>
            <DropdownMenuItem>삭제</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>

      <div className="ml-6 flex flex-row gap-2">
        <Badge variant="secondary">
          <CalendarIcon />
          {activity.activityDate}
        </Badge>
        <Badge variant="secondary">
          <UsersIcon />
          {activity.participantCount}명 참여
        </Badge>
        <Badge variant="secondary">
          <TagIcon />
          {activity.tag}
        </Badge>
      </div>

      <CardContent
        className={`${activity.activityImages?.length ? 'gap-4' : 'gap-0'} flex flex-col`}>
        <div className="flex flex-col gap-2 md:flex-row">
          {activity.activityImages?.map((image, index) => (
            <div key={index} className={index > 0 ? 'hidden md:block' : ''}>
              <Image
                src={image}
                alt={`${activity.title} - 이미지 ${index + 1}`}
                width={288}
                height={216}
                className="h-54 aspect-[4/3] rounded-md border object-cover"
                unoptimized // TODO: 샘플이미지 크기가 커서 사진이 안나오는걸 방지, 나중에 제거해야함
              />
            </div>
          ))}
        </div>

        <div className="prose line-clamp-4 max-w-none md:line-clamp-6">
          <p className="whitespace-pre-wrap">{activity.content}</p>
        </div>
      </CardContent>
    </Card>
  );
};
