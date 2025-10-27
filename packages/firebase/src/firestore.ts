import { firebaseDb } from '@workspace/firebase/firebase-config';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

class PreRegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PreRegistrationError';
  }
}

const PRE_REGISTRATION_COLLECTION = 'preRegistrations';

export const savePreRegistrationInfo = async (
  email: string,
  schoolName: string,
  clubCategory: string,
): Promise<void> => {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const docRef = doc(
      firebaseDb,
      PRE_REGISTRATION_COLLECTION,
      normalizedEmail,
    );

    // 이미 등록된 이메일인지 확인
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      throw new PreRegistrationError(
        '한 계정 당 한 번만 사전 등록할 수 있어요.',
      );
    }

    // 문서 ID를 이메일로 사용하여 저장
    await setDoc(docRef, {
      createdAt: serverTimestamp(),
      email: normalizedEmail,
      schoolName: schoolName,
      clubCategory: clubCategory,
    });
  } catch (error) {
    if (error instanceof PreRegistrationError) {
      throw error;
    }

    throw new PreRegistrationError(
      '사전 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
    );
  }
};
