'use client';

import { useState } from 'react';

import { JwtTestButton } from '@/_shared/clientBoundary/JwtTestButton';
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
import { CircleXIcon } from 'lucide-react';

import { NoticePostingDialogClient } from '../NoticePostingDialogClient';

const NOTICE_FILTER_OPTIONS = [
  { value: 'title', label: '제목' },
  { value: 'content', label: '내용' },
  { value: 'author', label: '작성자' },
] as const;

type NoticeFilterType = (typeof NOTICE_FILTER_OPTIONS)[number]['value'];

export const NoticeFilterClient = () => {
  const [filterType, setFilterType] = useState<NoticeFilterType>(
    NOTICE_FILTER_OPTIONS[0].value,
  );
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleClearSearch = () => {
    setSearchKeyword('');
  };

  return (
    <>
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="grid gap-2">
          <Label htmlFor="filterType">키워드</Label>
          <Select
            value={filterType}
            onValueChange={(value) => setFilterType(value as NoticeFilterType)}>
            <SelectTrigger id="filterType" className="w-full md:w-[160px]">
              <SelectValue placeholder="키워드 선택" />
            </SelectTrigger>
            <SelectContent>
              {NOTICE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="search">검색어</Label>
          <div className="relative w-full">
            <Input
              id="search"
              type="text"
              inputMode="search"
              placeholder="검색어를 입력해주세요"
              value={searchKeyword}
              className="pr-9"
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
            {searchKeyword && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClearSearch}
                className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent">
                <CircleXIcon />
                <span className="sr-only">검색어 초기화</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        {/** @todo 전체 공지사항 개수나 검색한 공지사항 개수 연결해야 함*/}
        <p className="text-muted-foreground">
          <span className="text-foreground font-semibold">{0}</span> 개 공지사항
          조회됨
        </p>
        <JwtTestButton />
        {/** @todo 공지사항 등록 기능 연동해야 함*/}
        <NoticePostingDialogClient />
      </div>
    </>
  );
};
