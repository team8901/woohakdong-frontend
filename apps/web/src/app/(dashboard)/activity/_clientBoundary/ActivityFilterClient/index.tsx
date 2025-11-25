'use client';

import { useState } from 'react';
import { type DateRange } from 'react-day-picker';

import { Button } from '@workspace/ui/components/button';
import { Calendar } from '@workspace/ui/components/calendar';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@workspace/ui/components/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { ChevronDownIcon, CircleXIcon } from 'lucide-react';

import { ActivityPostingDialogClient } from '../ActivityPostingDialogClient';

const ACTIVITY_FILTER_OPTIONS = [
  { value: 'title', label: '제목' },
  { value: 'content', label: '내용' },
  { value: 'author', label: '작성자' },
] as const;

const ACTIVITY_TAG_OPTIONS = [
  { value: 'all', label: '전체' },
  { value: 'study', label: '스터디' },
  { value: 'seminar', label: '세미나' },
  { value: 'meeting', label: '회의' },
] as const;

type ActivityFilterType = (typeof ACTIVITY_FILTER_OPTIONS)[number]['value'];

type ActivityTagType = (typeof ACTIVITY_TAG_OPTIONS)[number]['value'];

export const ActivityFilterClient = () => {
  const [filterType, setFilterType] = useState<ActivityFilterType>(
    ACTIVITY_FILTER_OPTIONS[0].value,
  );
  const [tagType, setTagType] = useState<ActivityTagType>(
    ACTIVITY_TAG_OPTIONS[0].value,
  );
  const [searchKeyword, setSearchKeyword] = useState('');
  const [range, setRange] = useState<DateRange | undefined>(undefined);

  const handleClearSearch = () => {
    setSearchKeyword('');
  };

  return (
    <>
      <div className="flex flex-col gap-3">
        <div className="grid gap-3 md:grid-cols-2">
          <div className="grid gap-2">
            <Label htmlFor="dates">날짜</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="trigger" id="dates">
                  {range?.from && range?.to
                    ? range.from.getTime() === range.to.getTime()
                      ? range.from.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : `${range.from.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })} ~ ${range.to.toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}`
                    : '전체'}
                  <ChevronDownIcon className="size-4 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full overflow-hidden" align="start">
                <Calendar
                  mode="range"
                  selected={range}
                  captionLayout="dropdown"
                  onSelect={(range) => {
                    setRange(range);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="tagType">태그</Label>
            <Select
              value={tagType}
              onValueChange={(value) => setTagType(value as ActivityTagType)}>
              <SelectTrigger id="tagType" className="w-full">
                <SelectValue placeholder="태그 선택" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_TAG_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-[1fr_5fr]">
          <div className="grid min-w-36 gap-2">
            <Label htmlFor="filterType">키워드</Label>
            <Select
              value={filterType}
              onValueChange={(value) =>
                setFilterType(value as ActivityFilterType)
              }>
              <SelectTrigger id="filterType" className="w-full">
                <SelectValue placeholder="키워드 선택" />
              </SelectTrigger>
              <SelectContent>
                {ACTIVITY_FILTER_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="search">검색어</Label>
            <div className="w-full">
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
      </div>

      <div className="flex items-center justify-between">
        {/** @todo 전체 활동 개수나 검색한 활동 개수 연결해야 함*/}
        <p className="text-muted-foreground">
          <span className="text-foreground font-semibold">{0}</span> 개 활동
          기록 조회됨
        </p>
        {/** @todo 활동 등록 기능 연동해야 함*/}
        <ActivityPostingDialogClient />
      </div>
    </>
  );
};
