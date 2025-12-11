'use client';

import {
  FADE_IN_UP_IMAGE_ANIMATION,
  FADE_IN_UP_TEXT_ANIMATION,
} from '@/app/_helpers/constants/animations';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { motion } from 'framer-motion';
import { Bell, BookOpen, Image, Pin, Users } from 'lucide-react';

const MOCK_NOTICES = [
  {
    title: '12월 정기모임 안내',
    date: '12월 10일',
    author: '김회장',
    isPinned: true,
  },
  {
    title: 'MT 참가 신청 받습니다',
    date: '12월 8일',
    author: '이부회장',
    isPinned: false,
  },
  {
    title: '회비 납부 안내',
    date: '12월 5일',
    author: '박총무',
    isPinned: false,
  },
];

const MOCK_ACTIVITIES = [
  {
    title: '11월 정기모임',
    date: '11월 25일',
    participants: 28,
    tag: '정기모임',
    images: 3,
  },
  {
    title: '가을 MT',
    date: '11월 15일',
    participants: 35,
    tag: 'MT',
    images: 12,
  },
  {
    title: '신입생 환영회',
    date: '11월 1일',
    participants: 42,
    tag: '행사',
    images: 8,
  },
];

export const CommunicationFeaturesSectionClient = () => {
  return (
    <section
      id="feature_communication"
      className="bg-background py-20 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <h2 className="text-primary mb-12 text-lg font-semibold md:text-2xl">
          공유
        </h2>
        <div className="flex flex-col gap-8">
          <motion.div {...FADE_IN_UP_TEXT_ANIMATION} className="text-center">
            <h3 className="text-foreground text-2xl font-semibold md:text-4xl">
              알려야하는 정보도 투명하게
            </h3>
            <p className="text-muted-foreground mt-4 md:text-xl">
              활동기록부터 일정, 공지사항까지 쉽게 공유할 수 있어요.
            </p>
          </motion.div>
          <motion.div
            {...FADE_IN_UP_IMAGE_ANIMATION}
            className="grid gap-6 md:grid-cols-2">
            {/* 공지사항 카드 */}
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <Bell className="text-primary size-4" />
                  <CardTitle className="text-base">공지사항</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_NOTICES.map((notice, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/50 hover:bg-muted flex items-start gap-3 rounded-lg p-3 transition-colors">
                    {notice.isPinned && (
                      <Pin className="text-primary mt-0.5 size-4 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground truncate text-sm font-medium">
                        {notice.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {notice.date} · {notice.author}
                      </p>
                    </div>
                    {notice.isPinned && (
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        고정
                      </Badge>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* 활동기록 카드 */}
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <BookOpen className="text-primary size-4" />
                  <CardTitle className="text-base">활동기록</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {MOCK_ACTIVITIES.map((activity, idx) => (
                  <div
                    key={idx}
                    className="bg-muted/50 hover:bg-muted flex items-center gap-3 rounded-lg p-3 transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-foreground truncate text-sm font-medium">
                          {activity.title}
                        </p>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {activity.tag}
                        </Badge>
                      </div>
                      <div className="text-muted-foreground mt-1 flex items-center gap-3 text-xs">
                        <span>{activity.date}</span>
                        <span className="flex items-center gap-1">
                          <Users className="size-3" />
                          {activity.participants}명
                        </span>
                        <span className="flex items-center gap-1">
                          <Image className="size-3" />
                          {activity.images}장
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          {/* 회원들 반응 미리보기 */}
          <motion.div
            {...FADE_IN_UP_IMAGE_ANIMATION}
            className="flex justify-center">
            <Card className="w-full max-w-md shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {['김', '이', '박', '최', '정'].map((name, idx) => (
                      <Avatar
                        key={idx}
                        className="border-background size-8 border-2">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {name}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    <div className="border-background bg-muted flex size-8 items-center justify-center rounded-full border-2">
                      <span className="text-muted-foreground text-xs">+37</span>
                    </div>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    42명의 회원이 활동 중
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
