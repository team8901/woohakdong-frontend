import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_MEMBER_GENDER } from '@/app/(dashboard)/member/_helpers/constants/clubMemberGender';
import { CLUB_MEMBER_ROLE } from '@/app/(dashboard)/member/_helpers/constants/clubMemberRole';
import { type ClubMembersResponse } from '@/data/club/getClubMembers/type';

type Props = {
  members: ClubMembersResponse[];
};

export const MemberTable = ({ members }: Props) => {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            ID
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            이름
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            역할
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            성별
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            전화번호
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            이메일
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            학과
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            학번
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
            가입일
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {members.map((member) => (
          <tr key={member.id}>
            <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
              {member.id}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {member.name}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {getKeyByValue(CLUB_MEMBER_ROLE, member.role)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {getKeyByValue(CLUB_MEMBER_GENDER, member.gender)}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {member.phoneNumber}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {member.email}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {member.major}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {member.studentNumber}
            </td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
              {member.joinedDate}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
