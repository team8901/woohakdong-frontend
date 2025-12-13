import { useState } from 'react';

import { DEFAULT_QUERY } from '@/app/clubs/[clubEnglishName]/member/_helpers/constants/defaultOption';

import {
  DEFAULT_NOTICE_KEYWORD_OPTION,
  type NoticeKeywordOptions,
} from '../constants/noticeKeywordOptions';

export const useNoticesFilter = () => {
  const [keywordQuery, setKeywordQuery] = useState<NoticeKeywordOptions>(
    DEFAULT_NOTICE_KEYWORD_OPTION,
  );
  const [searchQuery, setSearchQuery] = useState(DEFAULT_QUERY);

  const handleKeywordQueryChange = (value: NoticeKeywordOptions) => {
    setKeywordQuery(value);
  };

  const handleSearchQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchQueryClear = () => {
    setSearchQuery(DEFAULT_QUERY);
  };

  const filters = {
    keywordQuery,
    searchQuery,
  };

  const handlers = {
    handleKeywordQueryChange,
    handleSearchQueryChange,
    handleSearchQueryClear,
  };

  return {
    filters,
    handlers,
  };
};
