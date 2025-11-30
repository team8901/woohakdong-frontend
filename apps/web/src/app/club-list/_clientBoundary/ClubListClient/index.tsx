'use client';

import { useMemo } from 'react';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
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
import { ChevronRight } from 'lucide-react';
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

  const handleClubClick = (nameEn: string) => {
    router.push(
      buildUrlWithParams({
        url: APP_PATH.CLUBS.HOME,
        pathParams: { clubEnglishName: nameEn },
      }),
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="mb-6 text-3xl font-bold">내 동아리</h1>
      {clubs.length === 0 ? (
        <p className="text-muted-foreground">가입한 동아리가 없습니다.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clubs.map((club) => (
            <Card
              key={club.id}
              className="cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => handleClubClick(club.nameEn!)}>
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
        </div>
      )}
    </div>
  );
};
