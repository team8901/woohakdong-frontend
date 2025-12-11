'use client';

import { useState } from 'react';

import { showToast } from '@/_shared/helpers/utils/showToast';
import { useQueryClient } from '@tanstack/react-query';
import {
  type FormQuestionType,
  getGetAllClubApplicationFormsQueryKey,
  useCreateClubApplicationForm,
} from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Spinner } from '@workspace/ui/components/spinner';
import { PlusIcon } from 'lucide-react';

import { QuestionItem } from '../../_components/QuestionItem';
import {
  createEmptyQuestion,
  type FormQuestion,
} from '../../_helpers/types/formQuestion';

type Props = {
  clubId: number;
};

export const ApplicationFormCreateDialogClient = ({ clubId }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [questions, setQuestions] = useState<FormQuestion[]>([
    createEmptyQuestion(1),
  ]);

  const queryClient = useQueryClient();
  const { mutateAsync, isPending } = useCreateClubApplicationForm();

  const handleAddQuestion = () => {
    setQuestions((prev) => [...prev, createEmptyQuestion(prev.length + 1)]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length <= 1) return;

    setQuestions((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((q, i) => ({ ...q, order: i + 1 })),
    );
  };

  const handleQuestionChange = (
    index: number,
    field: keyof FormQuestion,
    value: string | boolean | string[] | FormQuestionType,
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== index) return q;

        const updated = { ...q, [field]: value };

        if (field === 'type' && value === 'TEXT') {
          updated.options = [];
        }

        return updated;
      }),
    );
  };

  const handleAddOption = (questionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex ? { ...q, options: [...q.options, ''] } : q,
      ),
    );
  };

  const handleRemoveOption = (questionIndex: number, optionIndex: number) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? { ...q, options: q.options.filter((_, oi) => oi !== optionIndex) }
          : q,
      ),
    );
  };

  const handleOptionChange = (
    questionIndex: number,
    optionIndex: number,
    value: string,
  ) => {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === questionIndex
          ? {
              ...q,
              options: q.options.map((o, oi) =>
                oi === optionIndex ? value : o,
              ),
            }
          : q,
      ),
    );
  };

  const handleSubmit = async () => {
    if (!formName.trim()) {
      showToast({ message: '신청서 제목을 입력해주세요.', type: 'error' });

      return;
    }

    const validQuestions = questions.filter((q) => q.question.trim());

    if (validQuestions.length === 0) {
      showToast({ message: '최소 하나의 질문을 입력해주세요.', type: 'error' });

      return;
    }

    try {
      await mutateAsync({
        clubId,
        data: {
          name: formName.trim(),
          formContent: validQuestions.map((q, i) => ({
            order: i + 1,
            question: q.question,
            type: q.type,
            required: q.required,
            options: q.options.filter((o) => o.trim()),
          })),
        },
      });

      await queryClient.invalidateQueries({
        queryKey: getGetAllClubApplicationFormsQueryKey(clubId),
      });

      showToast({ message: '신청서가 생성되었습니다.', type: 'success' });
      setIsOpen(false);
      resetForm();
    } catch {
      showToast({ message: '신청서 생성에 실패했습니다.', type: 'error' });
    }
  };

  const resetForm = () => {
    setFormName('');
    setQuestions([createEmptyQuestion(1)]);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);

    if (!open) resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm">
          <PlusIcon className="size-4" />
          신청서 만들기
        </Button>
      </DialogTrigger>
      <DialogContent
        className="flex max-h-[85vh] max-w-[95vw] flex-col md:max-w-lg"
        onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>가입 신청서 만들기</DialogTitle>
          <DialogDescription>
            동아리 가입 신청을 받을 양식을 만들어주세요.
          </DialogDescription>
        </DialogHeader>
        <div className="scrollbar-hide flex-1 space-y-6 overflow-y-auto py-4">
          <div className="space-y-2">
            <Label htmlFor="formName">신청서 제목 *</Label>
            <Input
              id="formName"
              placeholder="예: 2025년 1학기 신입부원 모집"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>질문 목록</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddQuestion}>
                <PlusIcon className="size-4" />
                질문 추가
              </Button>
            </div>

            {questions.map((question, qIndex) => (
              <QuestionItem
                key={qIndex}
                question={question}
                index={qIndex}
                canRemove={questions.length > 1}
                onQuestionChange={(value) =>
                  handleQuestionChange(qIndex, 'question', value)
                }
                onTypeChange={(value) =>
                  handleQuestionChange(qIndex, 'type', value)
                }
                onRequiredChange={(value) =>
                  handleQuestionChange(qIndex, 'required', value)
                }
                onAddOption={() => handleAddOption(qIndex)}
                onRemoveOption={(optionIndex) =>
                  handleRemoveOption(qIndex, optionIndex)
                }
                onOptionChange={(optionIndex, value) =>
                  handleOptionChange(qIndex, optionIndex, value)
                }
                onRemove={() => handleRemoveQuestion(qIndex)}
              />
            ))}
          </div>
        </div>
        <DialogFooter className="flex-shrink-0">
          <DialogClose asChild>
            <Button type="button" variant="outline" disabled={isPending}>
              취소
            </Button>
          </DialogClose>
          <Button onClick={handleSubmit} disabled={isPending}>
            {isPending ? (
              <>
                <Spinner />
                생성 중...
              </>
            ) : (
              '신청서 만들기'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
