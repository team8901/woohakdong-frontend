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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { FormData } from '../../_helpers/utils/zodSchemas';

type UserInfoFormProps = {
  form: UseFormReturn<FormData>;
};

export function UserInfoForm({ form }: UserInfoFormProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* 이름 입력 */}
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이름</FormLabel>
            <Tooltip>
              <TooltipTrigger>
                <FormControl>
                  <Input disabled type="text" {...field} />
                </FormControl>
              </TooltipTrigger>
              <TooltipContent>
                <p>구글 계정 이름으로 자동 설정돼요</p>
              </TooltipContent>
            </Tooltip>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 이메일 입력 */}
      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel>이메일</FormLabel>
            <Tooltip>
              <TooltipTrigger>
                <FormControl>
                  <Input disabled type="email" {...field} />
                </FormControl>
              </TooltipTrigger>
              <TooltipContent>
                <p>구글 계정 이메일로 자동 설정돼요</p>
              </TooltipContent>
            </Tooltip>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 성별 선택 */}
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>성별</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="성별을 선택해 주세요" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="male">남성</SelectItem>
                <SelectItem value="female">여성</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 휴대폰 번호 입력 */}
      <FormField
        control={form.control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel>휴대폰 번호</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="numeric"
                placeholder="- 없이 숫자만 입력해 주세요"
                {...field}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '').slice(0, 11);
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
