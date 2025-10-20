import { withSuspense } from '@/_shared/helpers/hoc/withSuspense';

import { QrCardClient } from '../../_clientBoundary/QrCardClient';

export const QrCardSuspense = withSuspense(() => {
  return <QrCardClient />;
});
