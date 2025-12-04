import { DEFAULT_OPTION, DEFAULT_OPTION_LABEL } from './defaultOption';

export const NOTICE_KEYWORD_OPTIONS = {
  내용: 'content',
  작성자: 'writer',
};

export type NoticeKeywordOptions =
  (typeof NOTICE_KEYWORD_OPTIONS)[keyof typeof NOTICE_KEYWORD_OPTIONS];

export const NOTICE_KEYWORD_OPTIONS_MENU = Object.entries({
  [DEFAULT_OPTION_LABEL]: DEFAULT_OPTION,
  ...NOTICE_KEYWORD_OPTIONS,
}).map(([label, value]) => ({
  label,
  value,
}));
