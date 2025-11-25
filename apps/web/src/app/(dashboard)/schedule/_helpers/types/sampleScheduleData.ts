import { type ScheduleEvent } from '.';

export const sampleScheduleData: ScheduleEvent[] = [
  {
    id: 1,
    title: '동아리 정기 회의',
    content: '동아리 정기 회의입니다.',
    color: '#A2C4E4',
    startTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      15,
      10,
      0,
    ),
    endTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      15,
      12,
      0,
    ),
  },
  {
    id: 2,
    title: '신입부원 환영회',
    content: '신입부원 환영회입니다.',
    color: '#FFE28A88',
    startTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      20,
      18,
      0,
    ),
    endTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      20,
      20,
      0,
    ),
  },
  {
    id: 3,
    title: '장기 프로젝트 마감',
    content: '장기 프로젝트 마감입니다.',
    startTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      5,
      9,
      0,
    ),
    endTime: new Date(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
      5,
      12,
      0,
    ),
  },
];
