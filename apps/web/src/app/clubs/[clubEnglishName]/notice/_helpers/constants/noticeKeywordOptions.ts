export const NOTICE_KEYWORD_OPTIONS = {
  제목: 'title',
  내용: 'content',
  작성자: 'writer',
} as const;

export type NoticeKeywordOptions =
  (typeof NOTICE_KEYWORD_OPTIONS)[keyof typeof NOTICE_KEYWORD_OPTIONS];

export const DEFAULT_NOTICE_KEYWORD_OPTION = NOTICE_KEYWORD_OPTIONS.제목;

export const NOTICE_KEYWORD_OPTIONS_MENU = Object.entries({
  ...NOTICE_KEYWORD_OPTIONS,
}).map(([label, value]) => ({
  label,
  value,
}));
