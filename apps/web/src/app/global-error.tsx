'use client'; // NOTE: Error boundaries must be Client Components

/**
 * web 서비스의 global error 를 핸들링하는 Error boundary
 * @see https://nextjs.org/docs/app/getting-started/error-handling
 */
const GlobalError = ({ error }: { error: Error & { digest?: string } }) => {
  return (
    // NOTE: global-error must include html and body tags
    <html lang="ko">
      <body>
        <h2>{error.message}</h2>
        <button
          onClick={() => {
            window.location.reload();
          }}>
          다시 시도하기
        </button>
      </body>
    </html>
  );
};

export default GlobalError;
