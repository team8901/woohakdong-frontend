import { ClubInfoSearchSuspense } from '@/app/club-list/_suspense/ClubInfoSearchSuspense';

const ClubListPage = () => {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center">
      <ClubInfoSearchSuspense />
    </div>
  );
};

export default ClubListPage;
