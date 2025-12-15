'use client';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import {
  type ClubItemHistoryResponse,
  type ClubItemResponse,
  type ClubMembershipResponse,
  type NoticeResponse,
} from '@workspace/api/generated';
import { Badge } from '@workspace/ui/components/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { BookOpen, ChevronRight, Package, Pin, Users } from 'lucide-react';
import Link from 'next/link';

import { sampleActivityData } from '../../activity/_helpers/types/sampleActivityData';
import {
  CLUB_MEMBER_ROLE,
  type ClubMemberRole,
} from '../../member/_helpers/constants/clubMemberRole';
import { sampleScheduleData } from '../../schedule/_helpers/types/sampleScheduleData';

type Props = {
  clubEnglishName: string;
  clubMemberRole: ClubMemberRole;
  members: ClubMembershipResponse[];
  items: ClubItemResponse[];
  notices: NoticeResponse[];
  itemHistory: ClubItemHistoryResponse[];
};

const OFFICER_ROLES: ClubMemberRole[] = [
  CLUB_MEMBER_ROLE.회장,
  CLUB_MEMBER_ROLE.부회장,
  CLUB_MEMBER_ROLE.총무,
  CLUB_MEMBER_ROLE.임원,
];

export const DashboardClient = ({
  clubEnglishName,
  clubMemberRole,
  members,
  items,
  notices,
  itemHistory,
}: Props) => {
  const isOfficer = OFFICER_ROLES.includes(clubMemberRole);

  const rentedItems = items.filter((item) => item.using);
  const recentNotices = notices.slice(0, 5);
  const upcomingSchedules = sampleScheduleData
    .filter((schedule) => schedule.startTime > new Date())
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
    .slice(0, 3);
  const recentRentals = itemHistory
    .filter((item) => !item.returnDate)
    .slice(0, 5);
  const recentActivities = sampleActivityData.slice(0, 3);

  const buildClubPath = (path: string) =>
    buildUrlWithParams({
      url: path,
      pathParams: { clubEnglishName },
    });

  return (
    <div className="space-y-6">
      {/* 임원진 전용: 통계 카드 */}
      {isOfficer && (
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 회원</CardTitle>
              <Users className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}명</div>
              <p className="text-muted-foreground text-xs">
                활동 중인 동아리 회원
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">등록 물품</CardTitle>
              <Package className="text-muted-foreground size-4" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{items.length}개</div>
              <p className="text-muted-foreground text-xs">
                {rentedItems.length}개 대여 중
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 공통: 공지사항 & 일정 */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 최근 공지사항 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>최근 공지사항</CardTitle>
                <CardDescription>동아리 최신 소식을 확인하세요</CardDescription>
              </div>
              <Link
                href={buildClubPath(APP_PATH.CLUBS.NOTICE)}
                className="text-muted-foreground hover:text-foreground text-sm">
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentNotices.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                공지사항이 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {recentNotices.map((notice) => (
                  <Link
                    key={notice.id}
                    href={
                      buildClubPath(APP_PATH.CLUBS.NOTICE) + `/${notice.id}`
                    }
                    className="hover:bg-muted flex items-start gap-3 rounded-md p-2 transition-colors">
                    {notice.isPinned && (
                      <Pin className="text-primary mt-0.5 size-4 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {notice.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {notice.updatedAt} · {notice.writer}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 다가오는 일정 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>다가오는 일정</CardTitle>
                <CardDescription>예정된 동아리 일정입니다</CardDescription>
              </div>
              <Link
                href={buildClubPath(APP_PATH.CLUBS.SCHEDULE)}
                className="text-muted-foreground hover:text-foreground text-sm">
                <ChevronRight className="size-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {upcomingSchedules.length === 0 ? (
              <p className="text-muted-foreground py-4 text-center text-sm">
                예정된 일정이 없습니다
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className="flex items-center gap-3 rounded-md p-2">
                    <div
                      className="size-3 shrink-0 rounded-full"
                      style={{ backgroundColor: schedule.color ?? '#6366f1' }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {schedule.title}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {schedule.startTime.toLocaleDateString('ko-KR', {
                          month: 'long',
                          day: 'numeric',
                          weekday: 'short',
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 공통: 활동기록 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>최근 활동기록</CardTitle>
              <CardDescription>동아리 활동 내역을 확인하세요</CardDescription>
            </div>
            <Link
              href={buildClubPath(APP_PATH.CLUBS.ACTIVITY)}
              className="text-muted-foreground hover:text-foreground text-sm">
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentActivities.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              활동기록이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <Link
                  key={activity.id}
                  href={
                    buildClubPath(APP_PATH.CLUBS.ACTIVITY) + `/${activity.id}`
                  }
                  className="hover:bg-muted flex items-center gap-3 rounded-md p-2 transition-colors">
                  <BookOpen className="text-muted-foreground size-4 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {activity.title}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {activity.activityDate} · {activity.tag} ·{' '}
                      {activity.participantCount}명 참여
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 공통: 대여 현황 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>대여 현황</CardTitle>
              <CardDescription>현재 대여 중인 물품 목록입니다</CardDescription>
            </div>
            <Link
              href={buildClubPath(APP_PATH.CLUBS.ITEM_HISTORY)}
              className="text-muted-foreground hover:text-foreground text-sm">
              <ChevronRight className="size-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentRentals.length === 0 ? (
            <p className="text-muted-foreground py-4 text-center text-sm">
              대여 중인 물품이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {recentRentals.map((rental) => (
                <div
                  key={rental.id}
                  className="flex items-center justify-between rounded-md p-2">
                  <div className="flex items-center gap-3">
                    <Package className="text-muted-foreground size-4" />
                    <div>
                      <p className="text-sm font-medium">{rental.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {rental.rentalDate} 대여
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary">대여 중</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
