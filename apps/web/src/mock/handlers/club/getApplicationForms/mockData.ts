import { type ListWrapperClubApplicationFormInfoResponse } from '@workspace/api/generated';

export const 신청폼_없음: ListWrapperClubApplicationFormInfoResponse = {
  data: [],
};

export const 신청폼_있음: ListWrapperClubApplicationFormInfoResponse = {
  data: [
    {
      clubApplicationFormId: 1,
      name: '2025년 1학기 신입부원 모집',
      formContent: [
        {
          order: 1,
          question: '지원 동기를 알려주세요',
          type: 'TEXT',
          required: true,
          options: [],
        },
        {
          order: 2,
          question: '사용 가능한 프로그래밍 언어를 선택해주세요',
          type: 'CHECKBOX',
          required: true,
          options: ['JavaScript', 'TypeScript', 'Python', 'Java', 'C++'],
        },
        {
          order: 3,
          question: '활동 가능한 요일을 선택해주세요',
          type: 'RADIO',
          required: true,
          options: ['평일만', '주말만', '모두 가능'],
        },
        {
          order: 4,
          question: '학년을 선택해주세요',
          type: 'SELECT',
          required: true,
          options: ['1학년', '2학년', '3학년', '4학년'],
        },
      ],
      createdAt: '2025-01-15T10:00:00',
    },
    {
      clubApplicationFormId: 2,
      name: '2024년 2학기 신입부원 모집',
      formContent: [
        {
          order: 1,
          question: '자기소개를 해주세요',
          type: 'TEXT',
          required: true,
          options: [],
        },
      ],
      createdAt: '2024-09-01T10:00:00',
    },
  ],
};
