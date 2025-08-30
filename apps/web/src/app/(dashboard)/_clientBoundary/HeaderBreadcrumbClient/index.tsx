'use client';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@workspace/ui/components/breadcrumb';
import { usePathname } from 'next/navigation';

import { getPathData } from '../../_helpers/utils/dashboardHeaderUtils';

export const HeaderBreadcrumbClient = () => {
  const pathname = usePathname();
  const headerData = getPathData(pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="block">{headerData.category}</BreadcrumbItem>
        <BreadcrumbSeparator className="block" />
        <BreadcrumbItem>
          <BreadcrumbPage>{headerData.title}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
};
