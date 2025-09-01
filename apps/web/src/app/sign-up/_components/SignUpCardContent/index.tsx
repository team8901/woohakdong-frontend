import { type UseFormReturn } from 'react-hook-form';

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

import { GENDER_OPTIONS } from '../../_helpers/constants';
import { type UserProfileFormData } from '../../_helpers/types';

export const SignUpCardContent = ({
  form,
}: {
  form: UseFormReturn<UserProfileFormData>;
}) => {
  return (
    <div className="flex flex-col gap-6">
      {/* 성별 선택 */}
      <FormField
        control={form.control}
        name="gender"
        render={({ field }) => (
          <FormItem>
            <FormLabel>성별</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ''}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="남성/여성" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {GENDER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 닉네임 입력 */}
      <FormField
        control={form.control}
        name="nickname"
        render={({ field }) => (
          <FormItem>
            <FormLabel>닉네임</FormLabel>
            <FormControl>
              <Input
                type="text"
                inputMode="text"
                placeholder="학동이"
                autoComplete="off"
                {...field}
              />
            </FormControl>
            <FormDescription className="flex flex-col">
              <span>• 2자 이상 20자 이내로 입력해 주세요</span>
              <span>• 한글, 영문, 숫자, (_), (-)만 사용 가능해요</span>
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 휴대폰 번호 입력 */}
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => {
          const formatPhoneNumber = (value: string): string => {
            const digits = value.replace(/\D/g, '').slice(0, 11);

            // 하이픈 자동 삽입
            if (digits.length <= 3) {
              return digits;
            } else if (digits.length <= 7) {
              return `${digits.slice(0, 3)}-${digits.slice(3)}`;
            } else {
              return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
            }
          };

          const handlePhoneNumberChange = (
            e: React.ChangeEvent<HTMLInputElement>,
          ) => {
            const digits = e.target.value.replace(/\D/g, '').slice(0, 11);

            field.onChange(formatPhoneNumber(digits));
          };

          return (
            <FormItem>
              <FormLabel>휴대폰 번호</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  inputMode="tel"
                  placeholder="010-1234-5678"
                  autoComplete="on"
                  value={formatPhoneNumber(field.value || '')}
                  onChange={handlePhoneNumberChange}
                />
              </FormControl>
              <FormDescription>
                • 대시(-)를 제외한 숫자만 입력해주세요
              </FormDescription>
              <FormMessage />
            </FormItem>
          );
        }}
      />

      {/* 학번 입력 */}
      <FormField
        control={form.control}
        name="studentId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>학번</FormLabel>
            <FormControl>
              <Input
                type="number"
                inputMode="numeric"
                placeholder="202512345"
                autoComplete="off"
                {...field}
              />
            </FormControl>
            <FormDescription>• 9-11자리 숫자만 입력 가능해요</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
