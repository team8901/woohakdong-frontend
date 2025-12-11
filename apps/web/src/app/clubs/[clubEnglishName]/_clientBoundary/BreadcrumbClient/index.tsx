'use client';

import { APP_PATH } from '@/_shared/helpers/constants/appPath';
import { buildUrlWithParams } from '@/_shared/helpers/utils/buildUrlWithParams';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb';
import Link from 'next/link';
import { useParams, usePathname } from 'next/navigation';

import { getPathData } from '../../_helpers/utils/dashboardHeaderUtils';

export const BreadcrumbClient = () => {
  const pathname = usePathname();
  const params = useParams<{ clubEnglishName: string }>();
  const headerData = getPathData(pathname);

  const homeUrl = buildUrlWithParams({
    url: APP_PATH.CLUBS.HOME,
    pathParams: { clubEnglishName: params.clubEnglishName },
  });

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="block">
          <BreadcrumbLink asChild>
            <Link href={homeUrl}>{headerData.category}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{headerData.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
