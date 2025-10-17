import { firebaseDb } from '@workspace/firebase/firebase-config';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';

class PreRegistrationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PreRegistrationError';
  }
}

const PRE_REGISTRATION_COLLECTION = 'preRegistrations';

export const savePreRegistrationEmail = async (
  email: string,
): Promise<void> => {
  try {
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!emailRegex.test(email)) {
      throw new PreRegistrationError('유효하지 않은 이메일 형식이에요');
    }

    const normalizedEmail = email.toLowerCase().trim();
    const docRef = doc(
      firebaseDb,
      PRE_REGISTRATION_COLLECTION,
      normalizedEmail,
    );

    // 이미 등록된 이메일인지 확인
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      throw new PreRegistrationError('이미 사전 등록된 이메일 주소예요.');
    }

    // 문서 ID를 이메일로 사용하여 저장
    await setDoc(docRef, {
      email: normalizedEmail,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (error instanceof PreRegistrationError) {
      throw error;
    }

    throw new PreRegistrationError(
      '이메일 등록 중 오류가 발생했습니다. 다시 시도해주세요.',
    );
  }
};
