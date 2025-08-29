type Params<PathParams, QueryParams> = {
  url: string;
  pathParams?: PathParams;
  queryParams?: QueryParams;
};

/**
 * pathParams 혹은 queryParams 를 사용해 URL 을 완성하는 유틸 함수
 * @param url - 파라미터를 넣기 전 원본 URL
 * @param pathParams - path parameter (예: `/info/:id`)
 * @param queryParams - query parameter (예: `/info?name=doit`)
 */
export function buildUrlWithParams<
  PathParams extends Record<string, string | number> = Record<
    string,
    string | number
  >,
  QueryParams extends Record<
    string,
    string | number | boolean | undefined
  > = Record<string, string | number | boolean | undefined>,
>({ url, pathParams, queryParams }: Params<PathParams, QueryParams>) {
  let newUrl = url;

  // path parameter 치환
  if (pathParams) {
    for (const [key, value] of Object.entries(pathParams)) {
      newUrl = newUrl.replace(`:${key}`, encodeURIComponent(String(value)));
    }
  }

  // query parameter 추가
  if (queryParams) {
    const searchParams = new URLSearchParams();

    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    }

    const queryString = String(searchParams);

    if (queryString) {
      newUrl += `?${queryString}`;
    }
  }

  return newUrl;
}
