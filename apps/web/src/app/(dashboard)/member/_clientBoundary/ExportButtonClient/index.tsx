'use client';

import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_MEMBER_GENDER } from '@/app/(dashboard)/member/_helpers/constants/clubMemberGender';
import { CLUB_MEMBER_ROLE } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { type ClubMembersResponse } from '@/data/club/getClubMembers/type';
import { Button } from '@workspace/ui/components/button';
import { DownloadIcon } from 'lucide-react';
import * as XLSX from 'xlsx';

type Props = {
  members: ClubMembersResponse[];
  selectedMembers: ClubMembersResponse[];
};

export const ExportButtonClient = ({ members, selectedMembers }: Props) => {
  const handleExport = () => {
    // 선택된 항목이 없거나 전체 선택된 경우 전체 내보내기, 아니면 선택된 항목만 내보내기
    const dataToExport =
      selectedMembers.length === 0 || selectedMembers.length === members.length
        ? members
        : selectedMembers;

    // 데이터를 Excel 형식으로 변환
    const data = dataToExport.map((member) => ({
      이름: member.name,
      역할: getKeyByValue(CLUB_MEMBER_ROLE, member.clubMemberRole),
      성별: getKeyByValue(CLUB_MEMBER_GENDER, member.gender),
      전화번호: member.phoneNumber,
      이메일: member.email,
      학과: member.major,
      학번: member.studentId,
      가입일: member.clubJoinDate,
    }));

    // 워크시트 생성
    const worksheet = XLSX.utils.json_to_sheet(data);

    // 컬럼 너비 설정
    worksheet['!cols'] = [
      { wch: 10 }, // 이름
      { wch: 10 }, // 역할
      { wch: 8 }, // 성별
      { wch: 15 }, // 전화번호
      { wch: 25 }, // 이메일
      { wch: 15 }, // 학과
      { wch: 12 }, // 학번
      { wch: 12 }, // 가입일
    ];

    // 워크북 생성
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, '회원 목록');

    // 파일 다운로드
    const fileName = `회원_목록_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      <DownloadIcon />
      내보내기
    </Button>
  );
};
