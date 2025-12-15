import { type FormQuestionType } from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { Trash2 } from 'lucide-react';

import {
  needsOptions,
  QUESTION_TYPE_LABELS,
} from '../../_helpers/constants/questionType';
import { type FormQuestion } from '../../_helpers/types/formQuestion';
import { OptionList } from '../OptionList';

type Props = {
  question: FormQuestion;
  index: number;
  canRemove: boolean;
  onQuestionChange: (value: string) => void;
  onTypeChange: (value: FormQuestionType) => void;
  onRequiredChange: (value: boolean) => void;
  onAddOption: () => void;
  onRemoveOption: (optionIndex: number) => void;
  onOptionChange: (optionIndex: number, value: string) => void;
  onRemove: () => void;
};

export const QuestionItem = ({
  question,
  index,
  canRemove,
  onQuestionChange,
  onTypeChange,
  onRequiredChange,
  onAddOption,
  onRemoveOption,
  onOptionChange,
  onRemove,
}: Props) => {
  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-start gap-2">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <span className="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full text-sm">
              {index + 1}
            </span>
            <Input
              placeholder="질문을 입력하세요"
              value={question.question}
              onChange={(e) => onQuestionChange(e.target.value)}
              className="flex-1"
            />
            {canRemove && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onRemove}>
                <Trash2 className="text-destructive size-4" />
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Select value={question.type} onValueChange={onTypeChange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(QUESTION_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <Switch
                id={`required-${index}`}
                checked={question.required}
                onCheckedChange={onRequiredChange}
              />
              <Label htmlFor={`required-${index}`} className="text-sm">
                필수
              </Label>
            </div>
          </div>

          {needsOptions(question.type) && (
            <OptionList
              options={question.options}
              onAddOption={onAddOption}
              onRemoveOption={onRemoveOption}
              onOptionChange={onOptionChange}
            />
          )}
        </div>
      </div>
    </div>
  );
};
