'use client';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
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
import {
  CalendarIcon,
  CircleEllipsisIcon,
  MoreVerticalIcon,
  UsersIcon,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';

import { type Activity, tagIconMap } from '../../_helpers/types';

type Props = {
  activity: Activity;
};

export const ActivityCardClient = ({ activity }: Props) => {
  const TagIcon = tagIconMap[activity.tag] ?? CircleEllipsisIcon;
  const router = useRouter();
  const { clubEnglishName } = useParams<{ clubEnglishName: string }>();

  const handleCardClick = (e: React.MouseEvent) => {
    // 드롭다운 메뉴 클릭 시에는 페이지 이동하지 않음
    if (
      (e.target as HTMLElement).closest('[role="menu"]') ||
      (e.target as HTMLElement).closest('button')
    ) {
      return;
    }

    router.push(
      buildUrlWithParams({
        url: APP_PATH.CLUBS.ACTIVITY_DETAIL,
        pathParams: { clubEnglishName, activityId: activity.id },
      }),
    );
  };

  return (
    <Card
      className="hover:bg-muted cursor-pointer gap-4 transition-colors"
      onClick={handleCardClick}>
      <CardHeader>
        <div className="flex flex-row items-start justify-between">
          <div className="flex-1 flex-col space-y-1">
            <CardTitle className="line-clamp-2">{activity.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <p>{activity.createdAt}</p>
              <p>{activity.writer}</p>
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
        </div>

        <div className="flex flex-row gap-2">
          <Badge variant="secondary">
            <CalendarIcon />
            {activity.activityDate} 활동
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
      </CardHeader>

      <CardContent
        className={`${activity.activityImages?.length ? 'gap-4' : 'gap-0'} flex flex-col`}>
        <div className="flex flex-col gap-2 md:flex-row">
          {activity.activityImages?.map((image, index) => (
            <div key={index} className={index > 0 ? 'hidden md:block' : ''}>
              <Image
                src={image}
                alt={`${activity.title} - 이미지 ${index + 1}`}
                width={160}
                height={120}
                className="h-30 aspect-[4/3] rounded-md border object-cover"
                unoptimized // TODO: 이 옵션을 안하면 예시 이미지가 안보임 나중에 제거해야 함
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
