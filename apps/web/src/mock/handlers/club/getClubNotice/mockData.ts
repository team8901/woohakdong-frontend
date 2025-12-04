import { type NoticeResponse } from '@workspace/api/generated';

export const 동아리_공지사항_단건_없음: NoticeResponse = {};

export const 동아리_공지사항_단건_있음: NoticeResponse = {
  id: 1,
  isPinned: true,
  title: 'Do-IT! 필독 사항입니다. 처음 가입하신 분들은 읽어주세요!',
  updatedAt: '2025-10-28',
  writer: '박상준',
  content:
    '아주대학교 프로그래밍 동아리 DoiT!의 이름은 Dream of interworking Team!의 약자입니다. 여기서 "interworking"이라는 단어는 "정보 연결이 가능하다", "두 시스템이 대화하기 위하여 필요한 프로세스" 등의 뜻을 가지고 있습니다. 그렇기에 DoiT!은 컴퓨터를 어려워하는 학생들이 컴퓨터와 쉽게 소통할 수 있도록, 사람과 사람끼리의 긍정적인 네트워킹을 형성할 수 있도록 징검다리 역할을 수행하는 것을 목적으로 2010년 설립되었습니다.',
};
