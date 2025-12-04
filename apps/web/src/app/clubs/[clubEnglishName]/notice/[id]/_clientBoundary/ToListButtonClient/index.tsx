'use client';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { Button } from '@workspace/ui/components/button';
import { ArrowLeftIcon } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export const ToListButtonClient = () => {
  const router = useRouter();
  const { clubEnglishName } = useParams<{ clubEnglishName: string }>();

  const handleBackClick = () => {
    router.replace(
      buildUrlWithParams({
        url: APP_PATH.CLUBS.NOTICE,
        pathParams: { clubEnglishName },
      }),
    );
  };

  return (
    <Button variant="ghost" onClick={handleBackClick}>
      <ArrowLeftIcon />
      목록으로
    </Button>
  );
};
