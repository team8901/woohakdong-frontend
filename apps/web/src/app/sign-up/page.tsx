'use client';

import React, { useState } from 'react';
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
import { LogOutIcon, ArrowRightIcon, ArrowLeftIcon } from 'lucide-react';

const SignUpPage = () => {
  const [step, setStep] = useState<1 | 2>(1);

  return (
    <div className="bg-background md:p-18 flex min-h-screen w-screen items-center justify-center px-6 py-12">
      <div className="mx-auto flex w-full max-w-md flex-col gap-12">
        {step === 1 ? (
          <div className="flex flex-col items-start justify-center text-xl font-bold">
            <p>반가워요! 🤗</p>
            <p>우학동의 멤버가 되어 함께 시작해볼까요?</p>
          </div>
        ) : (
          <div className="flex flex-col items-start justify-center text-xl font-bold">
            <p>이제 학적만 입력하면 회원가입이 완료돼요 🤩</p>
          </div>
        )}
        {step === 1 && (
          <div className="flex flex-col gap-6">
            {/* 이름 입력 */}
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="name">이름</Label>
              <Input disabled type="text" id="name" placeholder="강동우" />
            </div>

            {/* 이메일 입력 */}
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="email">이메일</Label>
              <Input
                disabled
                type="email"
                id="email"
                placeholder="alsdn1360@ajou.ac.kr"
              />
            </div>

            {/* 성별 선택 */}
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="gender">성별</Label>
              <Select defaultValue="">
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="성별을 선택해 주세요" />
                </SelectTrigger>
                <SelectContent className="w-full">
                  <SelectItem value="male">남성</SelectItem>
                  <SelectItem value="female">여성</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 휴대폰 번호 입력 */}
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="phone">휴대폰 번호</Label>
              <Input
                type="text"
                id="phone"
                placeholder="- 없이 숫자만 입력해 주세요"
              />
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            {/* 학교 입력 */}
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="university">학교</Label>
              <Input
                disabled
                type="text"
                id="university"
                placeholder="아주대학교"
              />
            </div>

            {/* 학과 입력 */}
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="major">학과</Label>
              <Input
                type="text"
                id="major"
                placeholder="학과를 입력해 주세요"
              />
            </div>

            {/* 학번 입력 */}
            <div className="grid w-full items-center gap-3">
              <Label htmlFor="studentNumber">학번</Label>
              <Input
                type="text"
                id="studentNumber"
                placeholder="학번을 입력해 주세요"
              />
            </div>
          </div>
        )}

        <div className="flex w-full items-center justify-between">
          <Button
            variant="outline"
            type="button"
            onClick={() => {
              if (step === 2) setStep(1);
              else {
                // TODO: 제출 핸들러 연결
                console.log('로그아웃');
              }
            }}>
            {step === 1 ? <LogOutIcon /> : <ArrowLeftIcon />}
            {step === 1 ? '로그아웃' : '이전'}
          </Button>
          <Button
            type="button"
            onClick={() => {
              if (step === 1) setStep(2);
              else {
                // TODO: 제출 핸들러 연결
                console.log('회원가입 완료');
              }
            }}>
            {step === 1 ? '다음' : '우학동 시작하기'}
            <ArrowRightIcon />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
