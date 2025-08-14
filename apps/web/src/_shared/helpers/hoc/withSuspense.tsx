import { getComponentName } from '@/_shared/helpers/utils/getComponentName';
import { ReactNode, Suspense } from 'react';

/**
 * 컴포넌트를 Suspense 로 감싸는 HOC
 */
export const withSuspense = <P extends Record<string, unknown>>(
  WrappedComponent: Promise<React.FC<P>> | React.FC<P>,
  options?: { fallback: ReactNode },
) => {
  const WithSuspense = (props: P) => {
    return (
      <Suspense fallback={options?.fallback}>
        {/* @ts-expect-error: 런타임에는 존재하지 않는 에러 */}
        <WrappedComponent {...props} />
      </Suspense>
    );
  };

  WithSuspense.displayName = `WithSuspense(${getComponentName(
    WrappedComponent as React.FC,
  )})`;

  return WithSuspense;
};
