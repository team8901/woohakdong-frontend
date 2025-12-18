import { DEFAULT_EVENT_COLOR } from '../constants';
import { type ScheduleEvent } from '.';

// 오늘 기준으로 일정 생성
const today = new Date();
const getDate = (daysFromToday: number, hour: number, minute = 0) => {
  const date = new Date(today);

  date.setDate(date.getDate() + daysFromToday);
  date.setHours(hour, minute, 0, 0);

  return date;
};

export const sampleScheduleData: ScheduleEvent[] = [
  // 오늘 일정
  {
    id: 1,
    title: '동아리 정기 회의',
    content: '동아리 정기 회의입니다. 이번 달 활동 계획을 논의합니다.',
    color: '#A2C4E4',
    startTime: getDate(0, 14, 0),
    endTime: getDate(0, 16, 0),
  },
  // 내일 일정
  {
    id: 2,
    title: '스터디 모임',
    content: '알고리즘 스터디 - 그래프 탐색',
    color: '#90EE90',
    startTime: getDate(1, 10, 0),
    endTime: getDate(1, 12, 0),
  },
  {
    id: 3,
    title: '코드 리뷰',
    content: '주간 코드 리뷰 세션',
    color: '#87CEEB',
    startTime: getDate(1, 14, 0),
    endTime: getDate(1, 15, 0),
  },
  // 3일 후 - 여러 일정
  {
    id: 4,
    title: '프로젝트 회의',
    content: '프로젝트 진행 상황 공유 및 피드백',
    color: '#FFB6C1',
    startTime: getDate(3, 10, 0),
    endTime: getDate(3, 11, 30),
  },
  {
    id: 5,
    title: '워크샵',
    content: '팀 빌딩 워크샵 - 협업 도구 사용법',
    color: '#F0E68C',
    startTime: getDate(3, 13, 0),
    endTime: getDate(3, 15, 0),
  },
  {
    id: 6,
    title: '저녁 모임',
    content: '동아리원 저녁 식사',
    color: '#DDA0DD',
    startTime: getDate(3, 18, 0),
    endTime: getDate(3, 20, 0),
  },
  {
    id: 7,
    title: '멘토링',
    content: '신입부원 멘토링 세션',
    color: '#E6E6FA',
    startTime: getDate(3, 16, 0),
    endTime: getDate(3, 17, 30),
  },
  // 5일 후
  {
    id: 8,
    title: '신입부원 환영회',
    content: '신입부원 환영회입니다. 많은 참여 부탁드립니다.',
    color: '#FFE28A',
    startTime: getDate(5, 18, 0),
    endTime: getDate(5, 21, 0),
  },
  // 7일 후 - 해커톤 (2일)
  {
    id: 9,
    title: '해커톤',
    content: '24시간 해커톤 대회 참가',
    color: '#FF6B6B',
    startTime: getDate(7, 9, 0),
    endTime: getDate(8, 9, 0),
  },
  // 10일 후
  {
    id: 10,
    title: '발표 준비',
    content: '다음 주 발표 자료 준비',
    color: '#98FB98',
    startTime: getDate(10, 14, 0),
    endTime: getDate(10, 17, 0),
  },
  // 14일 후
  {
    id: 11,
    title: '동아리 축제',
    content: '학교 동아리 축제 참가 - 부스 운영',
    color: '#FF8C42',
    startTime: getDate(14, 10, 0),
    endTime: getDate(14, 18, 0),
  },
  // 21일 후
  {
    id: 12,
    title: '장기 프로젝트 마감',
    content: '이번 학기 장기 프로젝트 최종 제출',
    color: DEFAULT_EVENT_COLOR,
    startTime: getDate(21, 9, 0),
    endTime: getDate(21, 18, 0),
  },
  // 28일 후
  {
    id: 13,
    title: '정기 총회',
    content: '동아리 정기 총회 - 다음 학기 계획 논의',
    color: '#4ECDC4',
    startTime: getDate(28, 14, 0),
    endTime: getDate(28, 17, 0),
  },
];
