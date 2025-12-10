'use client';

import { useIsEditable } from '@/_shared/helpers/hooks/useIsEditable';
import { Button } from '@workspace/ui/components/button';
import { PlusIcon } from 'lucide-react';

export const SchedulePostingButtonClient = () => {
  const isEditable = useIsEditable();

  if (!isEditable) return null;

  return (
    <Button type="button">
      <PlusIcon /> 일정 등록
    </Button>
  );
};
