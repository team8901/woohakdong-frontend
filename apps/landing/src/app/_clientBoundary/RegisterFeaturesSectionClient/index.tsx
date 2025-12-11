'use client';

import {
  FADE_IN_UP_IMAGE_ANIMATION,
  FADE_IN_UP_TEXT_ANIMATION,
} from '@/app/_helpers/constants/animations';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { motion } from 'framer-motion';
import { CheckCircle2, Globe, Users } from 'lucide-react';

export const RegisterFeaturesSectionClient = () => {
  return (
    <section id="feature_register" className="bg-background py-20 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <h2 className="text-primary mb-12 text-lg font-semibold md:text-2xl">
          등록
        </h2>
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <motion.div
            {...FADE_IN_UP_TEXT_ANIMATION}
            className="md:w-1/2 md:gap-4">
            <h3 className="text-foreground text-2xl font-semibold md:text-4xl">
              <p>일단 간단하게</p>
              <p>동아리 등록부터</p>
            </h3>
            <div className="text-muted-foreground mt-4 md:text-xl">
              <p>동아리를 등록하고 나면</p>
              <p>동아리 전용 페이지를 받을 수 있어요.</p>
            </div>
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary size-5" />
                <span className="text-foreground text-sm">
                  5분 만에 동아리 등록 완료
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary size-5" />
                <span className="text-foreground text-sm">
                  전용 URL로 동아리 페이지 제공
                </span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-primary size-5" />
                <span className="text-foreground text-sm">
                  QR 코드로 간편한 회원 모집
                </span>
              </div>
            </div>
          </motion.div>
          <motion.div
            {...FADE_IN_UP_IMAGE_ANIMATION}
            className="flex flex-col gap-4 md:w-2/5">
            {/* 등록 폼 카드 */}
            <Card className="shadow-lg">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">동아리 등록</CardTitle>
                <CardDescription className="text-xs">
                  기본 정보를 입력해주세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">동아리 이름</Label>
                  <Input
                    placeholder="우학동 개발팀"
                    defaultValue="우학동 개발팀"
                    className="h-9 text-sm"
                    readOnly
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">영문 이름 (URL용)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground text-xs">
                      woohakdong.com/
                    </span>
                    <Input
                      placeholder="woohakdong-dev"
                      defaultValue="woohakdong-dev"
                      className="h-9 flex-1 text-sm"
                      readOnly
                    />
                  </div>
                </div>
                <Button className="w-full" size="sm">
                  등록하기
                </Button>
              </CardContent>
            </Card>
            {/* 등록 완료 카드 */}
            <Card className="border-primary/20 bg-primary/5 shadow-lg">
              <CardContent className="flex items-center gap-4 p-4">
                <Avatar className="size-12">
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                    우
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-foreground font-semibold">
                      우학동 개발팀
                    </p>
                    <Badge variant="secondary" className="text-xs">
                      <Globe className="mr-1 size-3" />
                      활성
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    woohakdong.com/woohakdong-dev
                  </p>
                  <div className="text-muted-foreground mt-1 flex items-center gap-1 text-xs">
                    <Users className="size-3" />
                    <span>42명 회원</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
