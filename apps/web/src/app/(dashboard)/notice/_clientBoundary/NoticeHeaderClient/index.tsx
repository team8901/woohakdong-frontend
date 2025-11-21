'use client';

import { useState } from 'react';

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

export const NoticeHeaderClient = () => {
  const [filterType, setFilterType] = useState('title');
  const [searchKeyword, setSearchKeyword] = useState('');

  const handleClearSearch = () => {
    setSearchKeyword('');
  };

  return (
    <div className="space-y-6">
      <div className="hidden flex-col md:flex">
        <h1 className="text-xl font-bold tracking-tight md:text-2xl">
          공지사항
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          중요한 공지사항과 새로운 소식을 확인해보세요
        </p>
      </div>

      <div className="flex flex-col gap-3 md:flex-row">
        <div className="grid flex-1 gap-2">
          <Label htmlFor="filterType">키워드</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger id="filterType" className="w-full">
              <SelectValue placeholder="키워드 선택" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="title">제목</SelectItem>
              <SelectItem value="content">내용</SelectItem>
              <SelectItem value="author">작성자</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-5 grid gap-2">
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
        {/** @todo 공지사항 등록 기능 연동해야 함*/}
        <NoticePostingDialogClient />
      </div>
    </div>
  );
};
