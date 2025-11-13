import {
  CLUB_MEMBER_GENDER_MENU,
  type ClubMemberGender,
} from '@/app/(dashboard)/member/_helpers/constants/clubMemberGender';
import {
  CLUB_MEMBER_ROLE_MENU,
  type ClubMemberRole,
} from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { type DefaultOption } from '@/app/(dashboard)/member/_helpers/constants/defaultOption';
import {
  CLUB_MEMBER_SORT_OPTION_MENU,
  type ClubMemberSortOption,
} from '@/app/(dashboard)/member/_helpers/constants/sortOption';
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
import { CircleXIcon, SearchIcon } from 'lucide-react';

type Props = {
  nameQuery: string;
  departmentQuery: string;
  roleQuery: ClubMemberRole | DefaultOption;
  genderQuery: ClubMemberGender | DefaultOption;
  sortOption: ClubMemberSortOption;
  handleNameQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNameQueryClear: () => void;
  handleDepartmentQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleDepartmentQueryClear: () => void;
  handleRoleChange: (value: ClubMemberRole | DefaultOption) => void;
  handleGenderChange: (value: ClubMemberGender | DefaultOption) => void;
  handleSortOptionChange: (value: ClubMemberSortOption) => void;
  handleSearch: () => void;
};

export const MemberFilter = ({
  nameQuery,
  departmentQuery,
  roleQuery,
  genderQuery,
  sortOption,
  handleNameQueryChange,
  handleNameQueryClear,
  handleDepartmentQueryChange,
  handleDepartmentQueryClear,
  handleRoleChange,
  handleGenderChange,
  handleSortOptionChange,
  handleSearch,
}: Props) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="search">검색</Label>
        <div className="flex flex-col gap-2 md:flex-row">
          <div className="relative w-full">
            <Input
              id="search"
              type="text"
              inputMode="search"
              placeholder="회원명 검색"
              value={nameQuery}
              className="pr-9"
              onChange={handleNameQueryChange}
            />
            {nameQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleNameQueryClear}
                className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent">
                <CircleXIcon />
                <span className="sr-only">회원명 검색 초기화</span>
              </Button>
            )}
          </div>
          <div className="relative w-full">
            <Input
              id="search"
              type="text"
              inputMode="search"
              placeholder="학과 검색"
              value={departmentQuery}
              className="pr-9"
              onChange={handleDepartmentQueryChange}
            />
            {departmentQuery && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDepartmentQueryClear}
                className="text-muted-foreground focus-visible:ring-ring/50 absolute inset-y-0 right-0 rounded-l-none hover:bg-transparent">
                <CircleXIcon />
                <span className="sr-only">학과 검색 초기화</span>
              </Button>
            )}
          </div>
          <Button type="submit" variant="secondary" onClick={handleSearch}>
            <SearchIcon />
            검색
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="roleQuery">직위</Label>
          <Select value={roleQuery} onValueChange={handleRoleChange}>
            <SelectTrigger id="roleQuery" className="w-full">
              <SelectValue placeholder="직위 선택" />
            </SelectTrigger>
            <SelectContent>
              {CLUB_MEMBER_ROLE_MENU.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="genderQuery">성별</Label>
          <Select value={genderQuery} onValueChange={handleGenderChange}>
            <SelectTrigger id="genderQuery" className="w-full">
              <SelectValue placeholder="성별 선택" />
            </SelectTrigger>
            <SelectContent>
              {CLUB_MEMBER_GENDER_MENU.map(({ label, value }) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="sortOption">정렬</Label>
          <Select value={sortOption} onValueChange={handleSortOptionChange}>
            <SelectTrigger id="sortOption" className="w-full">
              <SelectValue placeholder="정렬 선택" />
            </SelectTrigger>
            <SelectContent>
              {CLUB_MEMBER_SORT_OPTION_MENU.map(({ label, value }) => (
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
