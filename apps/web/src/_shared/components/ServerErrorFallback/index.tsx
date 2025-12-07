import { Card, CardContent } from '@workspace/ui/components/card';
import { SirenIcon } from 'lucide-react';

import { ServerErrorFallbackActions } from './ServerErrorFallbackActions';

type Props = {
  message?: string;
};

export const ServerErrorFallback = ({
  message = '데이터를 불러오지 못했어요',
}: Props) => {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="flex flex-col items-center justify-center gap-4 py-12">
        <SirenIcon className="text-destructive size-12" />
        <div className="flex flex-col items-center gap-2">
          <p className="text-lg font-semibold">문제가 발생했어요</p>
          <p className="text-muted-foreground text-center text-sm">{message}</p>
          <p className="text-muted-foreground text-center text-sm">
            페이지를 새로고침 하거나 잠시 후 다시 시도해 주세요.
          </p>
        </div>
        <ServerErrorFallbackActions />
      </CardContent>
    </Card>
  );
};
