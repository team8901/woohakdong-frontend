'use client';

import { useState } from 'react';

import { type MyProfileResponse } from '@/data/user/getMyProfile/type';

import { SonnerTestButton } from './SonnerTestButton';
import { TestButton } from './TestButton';

const NoticePage = () => {
  const [profileData, setProfileData] = useState<MyProfileResponse | null>(
    null,
  );
  const [hasError, setHasError] = useState(false);

  const handleDataReceived = (data: MyProfileResponse | null) => {
    if (data) {
      setProfileData(data);
      setHasError(false);
    } else {
      setProfileData(null);
      setHasError(true);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col items-start gap-12">
        <TestButton onDataReceived={handleDataReceived} />

        <>
          {hasError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-red-600">
                프로필 정보를 가져오는데 실패했습니다.
              </p>
            </div>
          )}

          {profileData && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6">
              <h2 className="mb-4 text-xl font-semibold">내 프로필 정보</h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">이름:</span>
                    <span className="ml-2">{profileData.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">닉네임:</span>
                    <span className="ml-2">{profileData.nickname}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">이메일:</span>
                    <span className="ml-2">{profileData.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium text-gray-700">전화번호:</span>
                    <span className="ml-2">{profileData.phoneNumber}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">학번:</span>
                    <span className="ml-2">{profileData.studentId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">성별:</span>
                    <span className="ml-2">{profileData.gender}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>

        <SonnerTestButton />
      </div>
    </div>
  );
};

export default NoticePage;
