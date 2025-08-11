'use client';

import { useTestInput } from '@/app/login/_helpers/stores/useTestInput';

/** TODO: 추후 삭제 */
export const TestInput = () => {
  // NOTE: zustand store 사용
  const [input, setInput] = useTestInput();

  return (
    <>
      <p>TestInput!!!</p>
      <input
        className="border"
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <p>{input}</p>
    </>
  );
};
