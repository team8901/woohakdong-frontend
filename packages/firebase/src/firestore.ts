import { firebaseDb } from '@workspace/firebase/firebase-config';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';

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
      throw new PreRegistrationError('유효하지 않은 이메일 형식입니다.');
    }

    await addDoc(collection(firebaseDb, PRE_REGISTRATION_COLLECTION), {
      email: email.toLowerCase().trim(),
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    if (error instanceof PreRegistrationError) {
      throw error;
    }

    throw new PreRegistrationError(
      '이메일 저장 중 오류가 발생했습니다. 다시 시도해주세요.',
    );
  }
};
