import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import { Input } from '@workspace/ui/components/input';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { FormData } from '../../_helpers/utils/zodSchemas';

type UserSchoolInfoFormProps = {
  form: UseFormReturn<FormData>;
};

export function UserSchoolInfoForm({ form }: UserSchoolInfoFormProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 학교 입력 */}
      <FormField
        control={form.control}
        name="university"
        render={({ field }) => (
          <FormItem>
            <FormLabel>학교</FormLabel>
            <Tooltip>
              <TooltipTrigger>
                <FormControl>
                  <Input disabled type="text" {...field} />
                </FormControl>
              </TooltipTrigger>
              <TooltipContent>
                <p>구글 계정의 도메인으로 자동 설정된 학교예요</p>
              </TooltipContent>
            </Tooltip>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 학과 입력 */}
      <FormField
        control={form.control}
        name="major"
        render={({ field }) => (
          <FormItem>
            <FormLabel>학과</FormLabel>
            <FormControl>
              <Input
                type="text"
                placeholder="학과를 입력해 주세요"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 학번 입력 */}
      <FormField
        control={form.control}
        name="studentNumber"
        render={({ field }) => (
          <FormItem>
            <FormLabel>학번</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="학번을 입력해 주세요"
                {...field}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
                  field.onChange(digits);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
