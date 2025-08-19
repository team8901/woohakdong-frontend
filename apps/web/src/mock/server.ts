import { setupServer } from 'msw/node';

import handlers from './handlers';

export const mockServerListen = () => {
  const mockServer = setupServer(...handlers);

  mockServer.listen();

  // mock server 가 요청을 가로채면 로그 출력
  mockServer.events.on('request:match', ({ request }) => {
    console.log(
      '\n[ MSW intercepted ]\n',
      request.method,
      request.url,
      `\n(cache: ${request.cache})\n`,
    );
  });
};
