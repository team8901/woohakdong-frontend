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
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import { motion } from 'framer-motion';
import { Camera, Guitar, Laptop, Megaphone, Package } from 'lucide-react';

const MOCK_ITEMS = [
  {
    name: 'DSLR 카메라',
    category: '촬영장비',
    status: '대여 가능',
    icon: Camera,
  },
  {
    name: '기타',
    category: '악기',
    status: '대여 중',
    icon: Guitar,
    borrower: '김민수',
  },
  { name: '노트북', category: '전자기기', status: '대여 가능', icon: Laptop },
  {
    name: '마이크',
    category: '음향장비',
    status: '대여 중',
    icon: Megaphone,
    borrower: '이서연',
  },
];

const MOCK_HISTORY = [
  {
    item: 'DSLR 카메라',
    borrower: '박지훈',
    borrowDate: '12월 5일',
    returnDate: '12월 10일',
  },
  { item: '기타', borrower: '김민수', borrowDate: '12월 8일', returnDate: '-' },
  {
    item: '노트북',
    borrower: '최유진',
    borrowDate: '12월 1일',
    returnDate: '12월 7일',
  },
  {
    item: '마이크',
    borrower: '이서연',
    borrowDate: '12월 10일',
    returnDate: '-',
  },
];

export const ItemFeaturesSectionClient = () => {
  return (
    <section id="feature_item" className="bg-muted/50 py-20 md:py-24">
      <div className="container mx-auto max-w-5xl px-6">
        <h2 className="text-primary mb-12 text-lg font-semibold md:text-2xl">
          물품
        </h2>
        {/* 물품 등록 기능 소개 부분 */}
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <motion.div
            {...FADE_IN_UP_IMAGE_ANIMATION}
            className="order-2 md:order-1 md:w-3/5">
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">물품 목록</CardTitle>
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    <Package className="mr-1 size-3" />
                    물품 등록
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {MOCK_ITEMS.map((item) => (
                    <div
                      key={item.name}
                      className="bg-muted/50 flex items-center gap-3 rounded-lg p-3">
                      <div className="bg-background flex size-10 items-center justify-center rounded-lg">
                        <item.icon className="text-primary size-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-foreground truncate text-sm font-medium">
                          {item.name}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {item.category}
                        </p>
                      </div>
                      <Badge
                        variant={
                          item.status === '대여 가능' ? 'default' : 'secondary'
                        }
                        className="shrink-0 text-xs">
                        {item.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            {...FADE_IN_UP_TEXT_ANIMATION}
            className="order-1 md:order-2 md:w-2/5 md:gap-4 md:pl-8">
            <h3 className="text-foreground text-2xl font-semibold md:text-4xl">
              <p>물품도 한 눈에</p>
            </h3>
            <div className="text-muted-foreground mt-4 md:text-xl">
              <p>물품을 등록하고</p>
              <p>대여 상태를 한 눈에 확인해 보세요.</p>
            </div>
          </motion.div>
        </div>
        {/* 물품 대여 기능 소개 부분 */}
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <motion.div
            {...FADE_IN_UP_TEXT_ANIMATION}
            className="order-1 md:w-2/5 md:gap-4 md:pr-8">
            <h3 className="text-foreground text-2xl font-semibold md:text-4xl">
              <p>대여 내역 관리까지</p>
            </h3>
            <div className="text-muted-foreground mt-4 md:text-xl">
              <p>누가, 언제 빌렸고, 언제 반납했는지</p>
              <p>과거 내역을 간편하게 보세요.</p>
            </div>
          </motion.div>
          <motion.div
            {...FADE_IN_UP_IMAGE_ANIMATION}
            className="order-2 md:w-3/5">
            <Card className="shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">대여 내역</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">물품</TableHead>
                      <TableHead className="text-xs">대여자</TableHead>
                      <TableHead className="text-xs">대여일</TableHead>
                      <TableHead className="text-right text-xs">
                        반납일
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_HISTORY.map((history, idx) => (
                      <TableRow key={idx} className="hover:bg-muted/50">
                        <TableCell className="text-foreground text-sm font-medium">
                          {history.item}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Avatar className="size-6">
                              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                {history.borrower.slice(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm">{history.borrower}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {history.borrowDate}
                        </TableCell>
                        <TableCell className="text-right">
                          {history.returnDate === '-' ? (
                            <Badge variant="secondary" className="text-xs">
                              대여 중
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">
                              {history.returnDate}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
