import { Badge } from '@workspace/ui/components/badge';
import { CalendarIcon, CircleEllipsisIcon, UsersIcon } from 'lucide-react';
import Image from 'next/image';

import { type Activity, tagIconMap } from '../../../_helpers/types';

export const ActivityDetailContents = ({
  activity,
}: {
  activity: Activity;
}) => {
  const TagIcon = tagIconMap[activity.tag] ?? CircleEllipsisIcon;

  return (
    <div className="flex w-full flex-col items-center">
      <div className="flex w-full max-w-3xl flex-col space-y-6">
        <div className="flex w-full flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            {activity.title}
          </h1>

          <div className="flex items-center gap-2">
            <p>{activity.createdAt}</p>
            <p>{activity.writer}</p>
          </div>
        </div>

        <div className="flex flex-row gap-2">
          <Badge variant="secondary" size="lg">
            <CalendarIcon />
            {activity.activityDate} 활동
          </Badge>
          <Badge variant="secondary" size="lg">
            <UsersIcon />
            {activity.participantCount}명 참여
          </Badge>
          <Badge variant="secondary" size="lg">
            <TagIcon />
            {activity.tag}
          </Badge>
        </div>

        <div
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
                  unoptimized // TODO: 이 옵션을 안하면 예시 이미지가 안보임 나중에 제거해야 함
                />
              </div>
            ))}
          </div>

          <div className="prose w-full max-w-none text-lg">
            <p className="whitespace-pre-wrap leading-relaxed">
              {activity.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
