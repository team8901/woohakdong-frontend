'use client';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { useDeleteNotice, useUpdateNotice } from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import { useParams, useRouter } from 'next/navigation';

type Props = {
  clubId: number;
  noticeId: number;
  title: string;
  content: string;
  isPinned: boolean;
};

export const GroupButtonsClient = ({
  clubId,
  noticeId,
  title,
  content,
  isPinned,
}: Props) => {
  const router = useRouter();
  const { clubEnglishName } = useParams<{ clubEnglishName: string }>();
  const { mutateAsync: mutateUpdateNotice } = useUpdateNotice();
  const { mutateAsync: mutateDeleteNotice } = useDeleteNotice();

  const handleTogglePin = async () => {
    await mutateUpdateNotice({
      clubId,
      noticeId,
      data: { title, content, isPinned: !isPinned },
    });
  };

  const handleEdit = () => {
    router.push(
      buildUrlWithParams({
        url: APP_PATH.CLUBS.NOTICE_EDIT,
        pathParams: { clubEnglishName, noticeId: noticeId.toString() },
      }),
    );
  };

  const handleDelete = async () => {
    await mutateDeleteNotice({ clubId, noticeId });
    router.push(
      buildUrlWithParams({
        url: APP_PATH.CLUBS.NOTICE,
        pathParams: { clubEnglishName },
      }),
    );
  };

  return (
    <div className="text-muted-foreground inline-flex w-fit rounded-md rtl:space-x-reverse">
      <Button
        variant="ghost"
        onClick={handleTogglePin}
        className="rounded-none rounded-l-md shadow-none focus-visible:z-10">
        {isPinned ? '고정 해제' : '고정'}
      </Button>
      <Button
        variant="ghost"
        onClick={handleEdit}
        className="rounded-none shadow-none focus-visible:z-10">
        수정
      </Button>
      <Button
        variant="ghost"
        onClick={handleDelete}
        className="rounded-none rounded-r-md shadow-none focus-visible:z-10">
        삭제
      </Button>
    </div>
  );
};
