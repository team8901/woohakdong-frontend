import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { PlusIcon, X } from 'lucide-react';

type Props = {
  options: string[];
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onOptionChange: (optionIndex: number, value: string) => void;
};

export const OptionList = ({
  options,
  onAddOption,
  onRemoveOption,
  onOptionChange,
}: Props) => {
  return (
    <div className="space-y-2 pl-6">
      <Label className="text-muted-foreground text-sm">선택지</Label>
      {options.map((option, oIndex) => (
        <div key={oIndex} className="flex items-center gap-2">
          <Input
            placeholder={`선택지 ${oIndex + 1}`}
            value={option}
            onChange={(e) => onOptionChange(oIndex, e.target.value)}
            className="flex-1"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onRemoveOption(oIndex)}>
            <X className="size-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAddOption}>
        <PlusIcon className="size-4" />
        선택지 추가
      </Button>
    </div>
  );
};
