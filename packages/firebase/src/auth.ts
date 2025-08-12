import {
  type User,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type UserCredential,
} from 'firebase/auth';

export type { User, UserCredential };

import { firebaseAuth } from '@workspace/firebase/firebase-config';

const googleProvider = new GoogleAuthProvider();

/**
 * 인증 상태 변화 감지
 * @param callback - 사용자 상태가 변경될 때 호출되는 콜백 함수
 * @returns unsubscribe 함수
 */
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(firebaseAuth, callback);
};

/**
 * Google 소셜 로그인
 * @returns Promise<UserCredential> - 로그인된 사용자 정보
 */
export const signInWithGoogle = async (): Promise<UserCredential> => {
  try {
    const result = await signInWithPopup(firebaseAuth, googleProvider);
    return result;
  } catch (error) {
    console.error('Google 로그인 실패:', error);
    throw error;
  }
};

/**
 * 로그아웃
 */
export const signOutWithGoogle = async (): Promise<void> => {
  try {
    await signOut(firebaseAuth);
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
};

/**
 * 현재 로그인된 사용자 정보 가져오기
 * @returns User | null - 현재 사용자 또는 null
 */
export const getCurrentUser = (): User | null => {
  return firebaseAuth.currentUser;
};

/**
 * 사용자 정보를 간단한 객체로 변환
 * @param user - Firebase User 객체
 * @returns 필요한 사용자 정보만 포함한 객체 또는 null
 */
export const getUserInfo = (user: User | null) => {
  if (!user) return null;

  return {
    uid: user.uid,
    email: user.email,
    displayName: user.displayName,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
};
