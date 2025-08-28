import { useSidebar } from '@workspace/ui/components/sidebar';

/**
 * 모바일 환경에서 사이드바 자동으로 닫는 훅
 * @returns handleMenuClick - 모바일에서 메뉴 클릭 시 사이드바를 닫는 핸들러 함수
 */
export const useMobileSidebarClose = () => {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleMenuClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return { handleMenuClick };
};
