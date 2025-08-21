'use client';

import { useEffect, useRef } from 'react';

import { IS_MOCK } from '@/mock/config/env';
import { api } from '@workspace/api/axios';

const ON_MSW_ENABLED = 'on-msw-enabled';

let isMockEnabled = false;

/**
 * 브라우저에서 mock server 활성화를 위한 컴포넌트
 * @returns null - 로직만 담겨있음
 */
export const EnableMockClient = () => {
  /**
   * react 에서는 strict mode 등에서 useEffect() 가 두 번 호출될 수 있어서,
   * isEffectCalled 로 한 번만 실행되도록 제한
   */
  const isEffectCalled = useRef(false);

  useEffect(() => {
    if (isEffectCalled.current) {
      return;
    }

    isEffectCalled.current = true;

    if (IS_MOCK && typeof window !== 'undefined') {
      (async () => {
        /**
         * msw init 시점의 race condition 을 방지하기 위한 interceptor 추가
         * 1. msw 가 활성화 되었으면, 요청을 바로 보냄
         * 2. msw 가 아직 활성화 되지 않았으면, 요청을 보류 (promise 반환)
         */
        api.interceptors.request.use((config) => {
          // 1. msw 가 활성화 되었으면, 요청을 바로 보냄
          if (isMockEnabled) {
            return config;
          }

          /**
           * 2. msw 가 활성화 되기 전에 axios 요청이 오면, promise 반환
           * resolve(config) 는 msw 가 start 되고 나면 실행됨 (window.dispatchEvent 통해)
           */
          return new Promise((resolve) => {
            window.addEventListener(ON_MSW_ENABLED, () => resolve(config), {
              once: true,
            });
          });
        });

        // tree shaking 가능하도록 dynamic import
        const importMswBrowser = () => import('msw/browser');
        const importHandlers = () => import('./handlers');

        const [{ setupWorker }, { default: handlers }] = await Promise.all([
          importMswBrowser(),
          importHandlers(),
        ]);

        const worker = setupWorker(...handlers);

        worker.start().then(() => {
          isMockEnabled = true;
          window.dispatchEvent(new CustomEvent(ON_MSW_ENABLED));
        });
      })();
    }
  }, []);

  return null;
};
