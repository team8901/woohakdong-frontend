import { getClubInfoSearch } from '@/data/club/getClubInfoSearch/fetch';

/**
 * 동아리 영문명으로 clubId를 조회합니다.
 * @param clubEnglishName 동아리 영문명
 * @returns clubId 또는 null (찾지 못한 경우)
 */
export const getClubIdByEnglishName = async (
  clubEnglishName: string,
): Promise<number | null> => {
  try {
    const response = await getClubInfoSearch({ nameEn: clubEnglishName });

    if (response.data && response.data.length > 0 && response.data[0]) {
      return response.data[0].id;
    }

    return null;
  } catch (error) {
    console.error('Failed to fetch club by English name:', error);

    return null;
  }
};
