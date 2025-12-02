'use client';

import { useEffect } from 'react';

import { setClubMemberRole } from '@/_shared/helpers/utils/setClubMemberRole';
import { useParams } from 'next/navigation';

export const ClubRoleInitializer = () => {
  const { clubEnglishName } = useParams<{ clubEnglishName: string }>();

  useEffect(() => {
    if (clubEnglishName) {
      setClubMemberRole(clubEnglishName);
    }
  }, [clubEnglishName]);

  return null;
};
