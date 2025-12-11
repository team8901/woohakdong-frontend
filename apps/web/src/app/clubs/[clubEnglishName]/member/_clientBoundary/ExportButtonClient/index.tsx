'use client';

import { useIsEditable } from '@/_shared/helpers/hooks/useIsEditable';
import { exportToExcel } from '@/_shared/helpers/utils/exportToExcel';
import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import {
  CLUB_MEMBER_GENDER,
  type ClubMemberGender,
} from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberGender';
import {
  CLUB_MEMBER_ROLE,
  type ClubMemberRole,
} from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/clubMemberRole';
import { MEMBER_EXPORT_CONFIG } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/memberExportConfig';
import { type ClubMembershipResponse } from '@workspace/api/generated';
import { Button } from '@workspace/ui/components/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import { DownloadIcon } from 'lucide-react';

type Props = {
  members: ClubMembershipResponse[];
  selectedMembers: ClubMembershipResponse[];
};

export const ExportButtonClient = ({ members, selectedMembers }: Props) => {
  const isEditable = useIsEditable();

  if (!isEditable) return null;

  const handleExport = () => {
    exportToExcel({
      allData: members,
      selectedData: selectedMembers,
      dataMapper: (member) => ({
        이름: member.name,
        역할:
          getKeyByValue(
            CLUB_MEMBER_ROLE,
            member.clubMemberRole as ClubMemberRole,
          ) ?? '',
        성별:
          getKeyByValue(
            CLUB_MEMBER_GENDER,
            member.gender as ClubMemberGender,
          ) ?? '',
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

  const isEmpty = members.length === 0;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={isEmpty ? 'cursor-not-allowed' : ''}>
          <Button
            type="button"
            variant="secondary"
            onClick={handleExport}
            disabled={isEmpty}
            className={isEmpty ? 'pointer-events-none' : ''}>
            <DownloadIcon />
            내보내기
          </Button>
        </span>
      </TooltipTrigger>
      {isEmpty && (
        <TooltipContent>내보낼 데이터가 없습니다</TooltipContent>
      )}
    </Tooltip>
  );
};
