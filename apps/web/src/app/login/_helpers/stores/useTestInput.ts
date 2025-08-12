import { createAtomStore } from '@workspace/store/createAtomStore';

/**
 * 테스트용 인풋 store
 * - TODO: 추후 삭제
 */
export const useTestInput = createAtomStore<string>('');
