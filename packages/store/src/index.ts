import { Dispatch, SetStateAction, useEffect, useMemo, useRef } from 'react';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

type Setter<S> = { setState: Dispatch<SetStateAction<S>> };

type State<S> = {
  state: S;
};

/**
 * 하나의 state 를 가진 (atomic 한) zustand store 를 생성하는 함수
 * @param initialValue - 초기값은 있을 수도, 없을 수도 있습니다.
 * @returns [state, setState] 배열을 반환하는 hook (React useState 와 유사한 형태)
 *
 * 1. 초기값이 있는 경우
 * - 사용 예시: `const useInput = createAtomStore<string>('')`
 * - ex) 입력 input 의 초기값은 대부분 빈 문자열
 *
 * 2. 초기값이 없는 경우
 * - 사용 예시: `const useInfo = createAtomStore<string>()`
 * - 런타임에서 동적으로 초기값이 결정되는 경우 store 를 생성하는 방식입니다.
 * - ex) 서버에서 fetch 한 데이터를 내려 받아 store 초기화
 */

// 1. 초기값이 있는 경우 overload
function createAtomStore<S>(
  initialValue: S,
): () => readonly [S, Dispatch<SetStateAction<S>>];

// 2. 초기값이 없는 경우 overload
function createAtomStore<S>(): {
  (initialValue: S): () => readonly [S, Dispatch<SetStateAction<S>>];
  (): readonly [S | undefined, Dispatch<SetStateAction<S | undefined>>];
};

// 함수 구현부
function createAtomStore<S>(initialValue?: S) {
  const store = create<State<S | undefined> & Setter<S | undefined>>()(
    devtools(
      (set) => ({
        state: initialValue,
        setState: (value) => {
          if (typeof value === 'function') {
            return set((prevState) => ({
              ...prevState,
              state: value(prevState.state),
            }));
          }

          return set((prevState) => ({ ...prevState, state: value }));
        },
      }),
      { anonymousActionType: 'setState', store: 'AtomStore' },
    ),
  );

  return (initialValue?: S) => {
    const initialValueRef = useRef(initialValue);

    const { state, setState } = store();

    useEffect(() => {
      if (initialValueRef.current !== undefined) {
        setState((prev) => {
          if (prev !== undefined) {
            /**
             * 여러 곳에서 초기화한 경우, warning
             * !! 해당 로그를 보았다면, 페이지 내 원치 않는 store 초기화가 존재할 가능성이 있습니다.
             * !! 의도와 다른 동작을 방지하기 위해, 한 곳에서만 store 를 초기화하는 것을 권장합니다.
             */
            console.warn(
              `zustand store 가 중복으로 초기화되고 있습니다.\n(prevValue: '${prev}' => newValue: '${initialValueRef.current}')`,
            );
          }

          return initialValueRef.current;
        });

        // 첫 렌더 이후 초기값을 다시 사용하지 않도록 undefined 할당
        initialValueRef.current = undefined;
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return useMemo(
      () => [state ?? initialValueRef.current, setState] as const,
      [state, setState],
    );
  };
}

export { createAtomStore };
