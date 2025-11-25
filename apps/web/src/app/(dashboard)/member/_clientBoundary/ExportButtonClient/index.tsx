'use client';

import { exportToExcel } from '@/_shared/helpers/utils/exportToExcel';
import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_MEMBER_GENDER } from '@/app/(dashboard)/member/_helpers/constants/clubMemberGender';
import { CLUB_MEMBER_ROLE } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { MEMBER_EXPORT_CONFIG } from '@/app/(dashboard)/member/_helpers/constants/memberExportConfig';
import { type ClubMembersResponse } from '@/data/club/getClubMembers/type';
import { Button } from '@workspace/ui/components/button';
import { DownloadIcon } from 'lucide-react';

type Props = {
  members: ClubMembersResponse[];
  selectedMembers: ClubMembersResponse[];
};

export const ExportButtonClient = ({ members, selectedMembers }: Props) => {
  const handleExport = () => {
    exportToExcel({
      allData: members,
      selectedData: selectedMembers,
      dataMapper: (member) => ({
        이름: member.name,
        역할: getKeyByValue(CLUB_MEMBER_ROLE, member.clubMemberRole) ?? '',
        성별: getKeyByValue(CLUB_MEMBER_GENDER, member.gender) ?? '',
        전화번호: member.phoneNumber,
        이메일: member.email,
        학과: member.major,
        학번: member.studentId,
        가입일: member.clubJoinDate,
      }),
      columnWidths: MEMBER_EXPORT_CONFIG.columnWidths,
      sheetName: MEMBER_EXPORT_CONFIG.sheetName,
      fileNamePrefix: MEMBER_EXPORT_CONFIG.fileNamePrefix,
    });
  };

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      <DownloadIcon />
      내보내기
    </Button>
  );
};
