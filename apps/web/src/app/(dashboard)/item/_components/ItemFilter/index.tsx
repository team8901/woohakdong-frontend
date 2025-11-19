import {
  CLUB_ITEM_CATEGORY_MENU,
  type ClubItemCategory,
} from '@/app/(dashboard)/item/_helpers/constants/clubItemCategory';
import {
  CLUB_ITEM_RENTAL_STATUS_MENU,
  type ClubItemRentalStatus,
} from '@/app/(dashboard)/item/_helpers/constants/clubItemRentalStatus';
import {
  CLUB_ITEM_SORT_OPTION_MENU,
  type ClubItemSortOption,
} from '@/app/(dashboard)/item/_helpers/constants/sortOption';
import { type DefaultOption } from '@/app/(dashboard)/member/_helpers/constants/defaultOption';
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

type Props = {
  filters: {
    nameQuery: string;
    renterQuery: string;
    categoryQuery: ClubItemCategory | DefaultOption;
    rentalStatusQuery: ClubItemRentalStatus | DefaultOption;
    sortOption: ClubItemSortOption;
  };
  handlers: {
    handleNameQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleNameQueryClear: () => void;
    handleRenterQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleRenterQueryClear: () => void;
    handleCategoryChange: (value: ClubItemCategory | DefaultOption) => void;
    handleRentalStatusChange: (
      value: ClubItemRentalStatus | DefaultOption,
    ) => void;
    handleSortOptionChange: (value: ClubItemSortOption) => void;
    handleSearch: () => void;
  };
};

export const ItemFilter = ({ filters, handlers }: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label>검색</Label>
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative w-full">
            <Input
              id="nameQuery"
              type="text"
              inputMode="search"
              placeholder="물품 이름 검색"
              value={filters.nameQuery}
              className="pr-9"
              onChange={handlers.handleNameQueryChange}
            />
            {filters.nameQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlers.handleNameQueryClear}
                className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent">
                <CircleXIcon />
                <span className="sr-only">물품명 검색 초기화</span>
              </Button>
            )}
          </div>
          <div className="relative w-full">
            <Input
              id="renterQuery"
              type="text"
              inputMode="search"
              placeholder="대여자 검색"
              value={filters.renterQuery}
              className="pr-9"
              onChange={handlers.handleRenterQueryChange}
            />
            {filters.renterQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handlers.handleRenterQueryClear}
                className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent">
                <CircleXIcon />
                <span className="sr-only">대여자 검색 초기화</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="categoryQuery">카테고리</Label>
          <Select
            value={filters.categoryQuery}
            onValueChange={handlers.handleCategoryChange}>
            <SelectTrigger id="categoryQuery" className="w-full">
              <SelectValue placeholder="카테고리 선택" />
            </SelectTrigger>
            <SelectContent>
              {CLUB_ITEM_CATEGORY_MENU.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="rentalStatusQuery">대여상태</Label>
          <Select
            value={filters.rentalStatusQuery}
            onValueChange={handlers.handleRentalStatusChange}>
            <SelectTrigger id="rentalStatusQuery" className="w-full">
              <SelectValue placeholder="대여상태 선택" />
            </SelectTrigger>
            <SelectContent>
              {CLUB_ITEM_RENTAL_STATUS_MENU.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="sortOption">정렬</Label>
          <Select
            value={filters.sortOption}
            onValueChange={handlers.handleSortOptionChange}>
            <SelectTrigger id="sortOption" className="w-full">
              <SelectValue placeholder="정렬 선택" />
            </SelectTrigger>
            <SelectContent>
              {CLUB_ITEM_SORT_OPTION_MENU.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};
