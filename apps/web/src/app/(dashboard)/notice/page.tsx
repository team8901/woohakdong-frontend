import { NoticeCardClient } from './_clientBoundary/NoticeCardClient';
import { NoticeHeaderClient } from './_clientBoundary/NoticeHeaderClient';

// 예시 데이터
const sampleNotices = [
  {
    id: 1,
    isPinned: true,
    title: '시스템 정기 점검 안내',
    updatedAt: '2025-10-28',
    writer: '박상준',
    content:
      '2025년 11월 5일 오전 2시부터 6시까지 시스템 정기 점검이 진행됩니다. 해당 시간 동안 서비스 이용이 제한될 수 있습니다.',
  },
  {
    id: 2,
    isPinned: false,
    title: '새로운 기능 업데이트 공지',
    updatedAt: '2025-10-25',
    writer: '박상준',
    content:
      '사용자 경험 개선을 위한 새로운 기능이 추가되었습니다. 대시보드에서 실시간 알림 기능을 확인하실 수 있습니다.',
  },
  {
    id: 3,
    isPinned: false,
    title: '보안 정책 변경 안내',
    updatedAt: '2025-10-22',
    writer: '박상준',
    content:
      '강화된 보안을 위해 비밀번호 정책이 변경되었습니다. 최소 8자 이상, 특수문자 포함이 필수입니다.',
  },
  {
    id: 4,
    isPinned: false,
    title: '보안 정책 변경 안내',
    updatedAt: '2025-10-22',
    writer: '박상준',
    content:
      '강화된 보안을 위해 비밀번호 정책이 변경되었습니다. 최소 8자 이상, 특수문자 포함이 필수입니다.',
  },
  {
    id: 5,
    isPinned: false,
    title: '보안 정책 변경 안내',
    updatedAt: '2025-10-22',
    writer: '박상준',
    content:
      '강화된 보안을 위해 비밀번호 정책이 변경되었습니다. 최소 8자 이상, 특수문자 포함이 필수입니다.',
  },
];

const NoticePage = () => {
  return (
    <div className="space-y-6">
      <NoticeHeaderClient />

      <div className="grid gap-6">
        {sampleNotices.map((notice) => (
          <NoticeCardClient key={notice.id} notice={notice} />
        ))}
      </div>
    </div>
  );
};

export default NoticePage;
