import { getKeyByValue } from '@/_shared/helpers/utils/getKeyByValue';
import { CLUB_ITEM_CATEGORY } from '@/app/(dashboard)/item/_helpers/constants/clubItemCategory';
import { getHistoryRentalStatusText } from '@/app/(dashboard)/item-history/_helpers/utils/getHistoryRentalStatusText';
import { type ClubItemHistoryResponse } from '@/data/club/getClubItemHistory/type';

type Props = {
  items: ClubItemHistoryResponse[];
};

export const ItemHistoryTable = ({ items }: Props) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
              물품명
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
              카테고리
            </th>
            {/* TODO: 대여자 필드 추가되면 활성화 */}
            {/* <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
              대여자
            </th> */}
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
              대여 상태
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
              대여 날짜
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
              반납 날짜
            </th>
            {/* TODO: 대여 메모 필드 추가되면 활성화 */}
            {/* <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-900">
              대여 메모
            </th> */}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {items.map((item) => (
            <tr key={item.id}>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {item.name}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {getKeyByValue(CLUB_ITEM_CATEGORY, item.category)}
              </td>
              {/* TODO: 대여자 필드 추가되면 활성화 */}
              {/* <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {item.renter}
              </td> */}
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {getHistoryRentalStatusText(item)}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {item.rentalDate ?? '-'}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {item.returnDate ?? '-'}
              </td>
              {/* TODO: 대여 메모 필드 추가되면 활성화 */}
              {/* <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {item.rentalMemo}
              </td> */}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
