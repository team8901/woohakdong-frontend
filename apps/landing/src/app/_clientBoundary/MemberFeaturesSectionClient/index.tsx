'use client';

import {
  FADE_IN_UP_IMAGE_ANIMATION,
  FADE_IN_UP_TEXT_ANIMATION,
} from '@/app/_helpers/constants/animations';
import { Avatar, AvatarFallback } from '@workspace/ui/components/avatar';
import { Badge } from '@workspace/ui/components/badge';
import { Input } from '@workspace/ui/components/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { MEMBER_FEATURES } from '@workspace/ui/constants/features';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';

const MOCK_MEMBERS = [
  {
    name: '김민수',
    studentId: '20210001',
    role: '회장',
    department: '컴퓨터공학과',
  },
  {
    name: '이서연',
    studentId: '20220015',
    role: '부회장',
    department: '경영학과',
  },
  {
    name: '박지훈',
    studentId: '20230042',
    role: '총무',
    department: '전자공학과',
  },
  {
    name: '최유진',
    studentId: '20210078',
    role: '회원',
    department: '디자인학과',
  },
  {
    name: '정하늘',
    studentId: '20220103',
    role: '회원',
    department: '심리학과',
  },
];

export const MemberFeaturesSectionClient = () => {
  return (
    <section id="feature_member" className="bg-muted/50 py-20 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <h2 className="text-primary mb-12 text-lg font-semibold md:text-2xl">
          회원
        </h2>
        <div className="flex flex-col gap-12 md:flex-row md:items-center md:justify-between">
          <motion.div
            {...FADE_IN_UP_TEXT_ANIMATION}
            className="md:w-1/2 md:gap-4">
            <h3 className="text-foreground text-2xl font-semibold md:text-4xl">
              <p>회원 관리,</p>
              <p>이제 엑셀은 그만</p>
            </h3>
            <div className="text-muted-foreground mt-4 md:text-xl">
              <p>복잡한 엑셀 대신 깔끔한 회원 관리.</p>
              <p>가입부터 명단 관리까지 한 곳에서.</p>
            </div>
            <motion.div
              {...FADE_IN_UP_IMAGE_ANIMATION}
              className="mt-8 grid grid-cols-2 gap-4">
              {MEMBER_FEATURES.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-background rounded-xl p-4 shadow-sm">
                  <feature.icon className="text-primary mb-2 size-6" />
                  <p className="text-foreground font-medium">{feature.title}</p>
                  <p className="text-muted-foreground text-sm">
                    {feature.description}
                  </p>
                </div>
              ))}
            </motion.div>
          </motion.div>
          <motion.div
            {...FADE_IN_UP_IMAGE_ANIMATION}
            className="bg-background overflow-hidden rounded-2xl shadow-lg md:w-2/5">
            <div className="border-b p-4">
              <div className="relative">
                <Search className="text-muted-foreground absolute left-3 top-1/2 size-4 -translate-y-1/2" />
                <Input
                  placeholder="이름, 학번으로 검색"
                  className="pl-9"
                  readOnly
                />
              </div>
            </div>
            <div className="max-h-[320px] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-[140px]">이름</TableHead>
                    <TableHead>학번</TableHead>
                    <TableHead className="text-right">역할</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_MEMBERS.map((member) => (
                    <TableRow
                      key={member.studentId}
                      className="hover:bg-muted/50">
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="size-7">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {member.name.slice(0, 1)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-foreground text-sm font-medium">
                              {member.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {member.department}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {member.studentId}
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant={
                            member.role === '회원' ? 'secondary' : 'default'
                          }
                          className="text-xs">
                          {member.role}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="text-muted-foreground border-t px-4 py-3 text-center text-xs">
              총 42명의 회원
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
