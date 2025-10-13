/**
 * 텍스트 요소에 사용되는 페이드인 애니메이션 (아래에서 위로, y: 60)
 */
export const FADE_IN_UP_TEXT_ANIMATION = {
  initial: { opacity: 0, y: 60 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: 0.3 },
  viewport: { once: true },
} as const;

/**
 * 이미지 요소에 사용되는 페이드인 애니메이션 (아래에서 위로, y: 80)
 */
export const FADE_IN_UP_IMAGE_ANIMATION = {
  initial: { opacity: 0, y: 80 },
  whileInView: { opacity: 1, y: 0 },
  transition: { duration: 0.8, delay: 0.1 },
  viewport: { once: true },
} as const;
