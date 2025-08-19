import { UseFormReturn } from 'react-hook-form';
import { FormData } from '../../_helpers/utils/zodSchemas';
import { Input } from '@workspace/ui/components/input';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@workspace/ui/components/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';

type SignUpFormProps = {
  form: UseFormReturn<FormData>;
};

export const SignUpForm = ({ form }: SignUpFormProps) => {
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
                <SelectItem value="MALE">남성</SelectItem>
                <SelectItem value="FEMALE">여성</SelectItem>
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
                inputMode="tel"
                placeholder="학동이"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* 휴대폰 번호 입력 */}
      <FormField
        control={form.control}
        name="phoneNumber"
        render={({ field }) => {
          const formatPhoneNumber = (value: string) => {
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

          return (
            <FormItem>
              <FormLabel>휴대폰 번호</FormLabel>
              <FormControl>
                <Input
                  type="text"
                  inputMode="tel"
                  placeholder="010-1234-5678"
                  value={formatPhoneNumber(field.value || '')}
                  onChange={(e) => {
                    const digits = e.target.value
                      .replace(/\D/g, '')
                      .slice(0, 11);
                    field.onChange(formatPhoneNumber(digits));
                  }}
                />
              </FormControl>
              <FormDescription>
                대시(-) 없이 숫자만 입력해주세요
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
                type="text"
                inputMode="numeric"
                placeholder="202512345"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
