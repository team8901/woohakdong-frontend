import { useState } from 'react';

import {
  DEFAULT_OPTION,
  DEFAULT_QUERY,
  type DefaultOption,
} from '../constants/defaultOption';
import { type NoticeKeywordOptions } from '../constants/noticeKeywordOptions';

export const useNoticesFilter = () => {
  const [keywordQuery, setKeywordQuery] = useState<
    NoticeKeywordOptions | DefaultOption
  >(DEFAULT_OPTION);
  const [searchQuery, setSearchQuery] = useState(DEFAULT_QUERY);

  const handleKeywordQueryChange = (
    value: NoticeKeywordOptions | DefaultOption,
  ) => {
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
