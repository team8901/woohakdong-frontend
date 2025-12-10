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

import {
  NOTICE_KEYWORD_OPTIONS_MENU,
  type NoticeKeywordOptions,
} from '../../_helpers/constants/noticeKeywordOptions';

type Props = {
  filters: {
    keywordQuery: NoticeKeywordOptions;
    searchQuery: string;
  };
  handlers: {
    handleKeywordQueryChange: (value: NoticeKeywordOptions) => void;
    handleSearchQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSearchQueryClear: () => void;
  };
};

export const NoticeFilter = ({ filters, handlers }: Props) => {
  return (
    <div className="grid gap-3 md:grid-cols-[1fr_5fr]">
      <div className="grid min-w-36 gap-2">
        <Label htmlFor="filterType">키워드</Label>
        <Select
          value={filters.keywordQuery}
          onValueChange={handlers.handleKeywordQueryChange}>
          <SelectTrigger id="filterType" className="w-full">
            <SelectValue placeholder="키워드 선택" />
          </SelectTrigger>
          <SelectContent>
            {NOTICE_KEYWORD_OPTIONS_MENU.map(({ label, value }) => (
              <SelectItem key={value} value={value}>
                {label}
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
            value={filters.searchQuery}
            className="pr-9"
            onChange={handlers.handleSearchQueryChange}
          />
          {filters.searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handlers.handleSearchQueryClear}
              className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent">
              <CircleXIcon />
              <span className="sr-only">검색어 초기화</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
