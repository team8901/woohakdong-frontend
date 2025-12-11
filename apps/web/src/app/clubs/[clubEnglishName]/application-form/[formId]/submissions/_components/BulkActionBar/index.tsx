import { Button } from '@workspace/ui/components/button';
import { Check, X } from 'lucide-react';

type Props = {
  selectedCount: number;
  onApprove: () => void;
  onReject: () => void;
  isProcessing: boolean;
};

export const BulkActionBar = ({
  selectedCount,
  onApprove,
  onReject,
  isProcessing,
}: Props) => {
  if (selectedCount === 0) return null;

  return (
    <div className="bg-muted/50 flex items-center justify-between rounded-lg border p-3">
      <span className="text-sm font-medium">{selectedCount}명 선택됨</span>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          onClick={onReject}
          disabled={isProcessing}>
          <X className="mr-1 size-4" />
          일괄 거절
        </Button>
        <Button size="sm" onClick={onApprove} disabled={isProcessing}>
          <Check className="mr-1 size-4" />
          일괄 승인
        </Button>
      </div>
    </div>
  );
};
