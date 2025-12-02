import { type ApiResponse } from '@/_shared/helpers/types/apiResponse';
import { type ClubItemHistoryResponse } from '@workspace/api/generated';

export const 동아리_물품_대여_내역_없음: ApiResponse<
  ClubItemHistoryResponse[]
> = {
  data: [],
};

export const 동아리_물품_대여_내역_있음: ApiResponse<
  ClubItemHistoryResponse[]
> = {
  data: [
    {
      id: 0,
      itemId: 0,
      memberId: 0,
      name: '노트북',
      memberName: '홍길동',
      category: 'DIGITAL',
      rentalDate: '2024-06-10',
      dueDate: '2024-06-17',
      returnDate: '2024-06-16',
      returnImage: undefined,
      overdue: false,
    },
    {
      id: 1,
      itemId: 1,
      memberId: 1,
      name: '프로젝터',
      memberName: '김철수',
      category: 'DIGITAL',
      rentalDate: '2024-06-12',
      dueDate: '2024-06-15',
      returnDate: undefined,
      returnImage: undefined,
      overdue: true,
    },
    {
      id: 2,
      itemId: 2,
      memberId: 2,
      name: '스피커',
      memberName: '이영희',
      category: 'DIGITAL',
      rentalDate: '2024-06-14',
      dueDate: '2024-06-19',
      returnDate: undefined,
      returnImage: undefined,
      overdue: false,
    },
  ],
};
