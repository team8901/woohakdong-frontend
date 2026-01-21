'use client';

import { useMemo } from 'react';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import { showToast } from '@/_shared/helpers/utils/showToast';
import {
  getGetJoinedClubsQueryKey,
  type ListWrapperClubInfoResponse,
  useGetJoinedClubs,
} from '@workspace/api/generated';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { ChevronRight, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Props = {
  initialData: ListWrapperClubInfoResponse;
};

export const ClubListClient = ({ initialData }: Props) => {
  const router = useRouter();
  const { data } = useGetJoinedClubs({
    query: {
      queryKey: getGetJoinedClubsQueryKey(),
      initialData,
    },
  });

  const clubs = useMemo(() => data!.data ?? [], [data]);

  const handleClubClick = (nameEn: string | undefined) => {
    if (!nameEn) {
      showToast({
        message: '동아리 정보를 불러오지 못했어요. 다시 시도해주세요.',
        type: 'error',
      });

      return;
    }

    router.push(
      buildUrlWithParams({
        url: APP_PATH.CLUBS.HOME,
        pathParams: { clubEnglishName: nameEn },
      }),
    );
  };

  const handleAddClub = () => {
    router.push(APP_PATH.REGISTER_CLUB.HOME);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">내 동아리</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {clubs.map((club) => (
          <Card
            key={club.id}
            className="cursor-pointer transition-shadow hover:shadow-lg"
            onClick={() => handleClubClick(club.nameEn)}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                {club.name}
                <ChevronRight className="h-5 w-5" />
              </CardTitle>
              <CardDescription>{club.nameEn}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{club.description}</p>
            </CardContent>
          </Card>
        ))}
        <Card
          className="border-muted-foreground/30 hover:border-primary hover:bg-primary/5 cursor-pointer border-2 border-dashed transition-colors"
          onClick={handleAddClub}>
          <CardHeader className="flex h-full items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="bg-muted flex h-12 w-12 items-center justify-center rounded-full">
                <Plus className="text-muted-foreground h-6 w-6" />
              </div>
              <CardTitle className="text-muted-foreground text-base">
                동아리 추가하기
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
};
