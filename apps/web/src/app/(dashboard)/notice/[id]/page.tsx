import { use } from 'react';

import { NoticeDetailContents } from './_components/NoticeDetailContents';
import { NoticeNotFound } from './_components/NoticeNotFound';
import { ToolbarHeader } from './_components/ToolbarHeader';

// 예시 데이터 (실제로는 API에서 가져와야 함)
const sampleNotices = [
  {
    id: 1,
    isPinned: true,
    title: 'Do-IT! 필독 사항입니다. 처음 가입하신 분들은 읽어주세요!',
    updatedAt: '2025-10-28',
    writer: '박상준',
    content:
      '아주대학교 프로그래밍 동아리 DoiT!의 이름은 Dream of interworking Team!의 약자입니다. 여기서 "interworking"이라는 단어는 "정보 연결이 가능하다", "두 시스템이 대화하기 위하여 필요한 프로세스" 등의 뜻을 가지고 있습니다. 그렇기에 DoiT!은 컴퓨터를 어려워하는 학생들이 컴퓨터와 쉽게 소통할 수 있도록, 사람과 사람끼리의 긍정적인 네트워킹을 형성할 수 있도록 징검다리 역할을 수행하는 것을 목적으로 2010년 설립되었습니다.',
  },
  {
    id: 2,
    isPinned: false,
    title: '다음 주 코딩 테스트 대비 스터디입니다.',
    updatedAt: '2025-10-25',
    writer: '박상준',
    content:
      '다음 주에 스터디 예정이니 당일 전까지 계속 공부해오시기 바랍니다. ^^',
  },
  {
    id: 3,
    isPinned: false,
    title: 'Do-IT! 활동 예정 목록입니다. 참고해 주세요.',
    updatedAt: '2025-10-22',
    writer: '박상준',
    content:
      'DoiT!은 다양한 IT 관련 기초 스터디를 진행 및 OBYB 홈커밍데이, IT 네트워킹 데이, 외부 강사 초청 컨퍼런스를 통해 활발히 교류를 진행하며 IT업계의 동향을 파악하고 토론하며 긍정적인 네트워킹을 형성해주는 역할을 하고 있습니다. 토이프로젝트, 해커톤, 공모전과 같은 다양한 실전 활동에 대한 정보를 공유하고 팀을 구하여 참가함으로써 실전 경험을 늘리는 활동을 하고 있습니다.',
  },
  {
    id: 4,
    isPinned: false,
    title: '공지사항 테스트 넘버 4',
    updatedAt: '2025-10-22',
    writer: '박상준',
    content:
      '공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4 공지사항 테스트 넘버 4',
  },
  {
    id: 5,
    isPinned: false,
    title:
      '보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내 보안 정책 변경 안내',
    updatedAt: '2025-10-22',
    writer: '박상준',
    content:
      '강화된 보안을 위해 비밀번호 정책이 변경되었습니다. 최소 8자 이상, 특수문자 포함이 필수입니다.',
  },
];

type props = {
  params: Promise<{
    id: string;
  }>;
};

const NoticeDetailPage = ({ params }: props) => {
  const { id } = use(params);
  const noticeId = Number(id);

  // 실제로는 API에서 데이터를 가져와야 함
  const notice = sampleNotices.find((n) => n.id === noticeId);

  if (!notice) {
    return <NoticeNotFound />;
  }

  return (
    <div className="space-y-6 md:space-y-10">
      <ToolbarHeader />
      <NoticeDetailContents notice={notice} />
    </div>
  );
};

export default NoticeDetailPage;
