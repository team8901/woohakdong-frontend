import { type ListWrapperClubApplicationSubmissionResponse } from '@workspace/api/generated';

export const 제출된_신청서_없음: ListWrapperClubApplicationSubmissionResponse = {
  data: [],
};

export const 제출된_신청서_있음: ListWrapperClubApplicationSubmissionResponse = {
  data: [
    {
      clubApplicationSubmissionId: 1,
      user: {
        userProfileId: 101,
        name: '김철수',
        studentId: '20210001',
        phoneNumber: '010-1234-5678',
        email: 'kim@example.com',
        major: '컴퓨터공학과',
      },
      formAnswers: [
        {
          order: 1,
          question: '지원 동기를 알려주세요',
          required: true,
          answer: '동아리 활동을 통해 개발 실력을 키우고 싶습니다.',
        },
        {
          order: 2,
          question: '사용 가능한 프로그래밍 언어를 선택해주세요',
          required: true,
          answer: ['JavaScript', 'TypeScript', 'Python'],
        },
        {
          order: 3,
          question: '활동 가능한 요일을 선택해주세요',
          required: true,
          answer: '모두 가능',
        },
        {
          order: 4,
          question: '학년을 선택해주세요',
          required: true,
          answer: '2학년',
        },
      ],
      submittedAt: '2025-01-20T14:30:00',
      applicationStatus: 'PENDING',
    },
    {
      clubApplicationSubmissionId: 2,
      user: {
        userProfileId: 102,
        name: '이영희',
        studentId: '20220002',
        phoneNumber: '010-2345-6789',
        email: 'lee@example.com',
        major: '소프트웨어학과',
      },
      formAnswers: [
        {
          order: 1,
          question: '지원 동기를 알려주세요',
          required: true,
          answer: '웹 개발에 관심이 많아 지원하게 되었습니다.',
        },
        {
          order: 2,
          question: '사용 가능한 프로그래밍 언어를 선택해주세요',
          required: true,
          answer: ['Java', 'Python'],
        },
        {
          order: 3,
          question: '활동 가능한 요일을 선택해주세요',
          required: true,
          answer: '평일만',
        },
        {
          order: 4,
          question: '학년을 선택해주세요',
          required: true,
          answer: '1학년',
        },
      ],
      submittedAt: '2025-01-21T09:15:00',
      applicationStatus: 'APPROVED',
    },
    {
      clubApplicationSubmissionId: 3,
      user: {
        userProfileId: 103,
        name: '박민수',
        studentId: '20230003',
        phoneNumber: '010-3456-7890',
        email: 'park@example.com',
        major: '정보통신학과',
      },
      formAnswers: [
        {
          order: 1,
          question: '지원 동기를 알려주세요',
          required: true,
          answer: '프로젝트 경험을 쌓고 싶습니다.',
        },
        {
          order: 2,
          question: '사용 가능한 프로그래밍 언어를 선택해주세요',
          required: true,
          answer: ['C++'],
        },
        {
          order: 3,
          question: '활동 가능한 요일을 선택해주세요',
          required: true,
          answer: '주말만',
        },
        {
          order: 4,
          question: '학년을 선택해주세요',
          required: true,
          answer: '3학년',
        },
      ],
      submittedAt: '2025-01-22T16:45:00',
      applicationStatus: 'REJECTED',
    },
  ],
};
