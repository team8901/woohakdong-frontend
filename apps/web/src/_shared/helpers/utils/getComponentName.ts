/**
 * 컴포넌트 이름을 반환하는 함수
 * @param Component
 * @returns 컴포넌트 이름
 */
export const getComponentName = (Component: React.FC) => {
  if (typeof Component === 'string') {
    return Component;
  }

  if (Component.displayName) {
    return Component.displayName;
  }

  if (Component.name) {
    return Component.name;
  }

  return 'UnknownComponent';
};
