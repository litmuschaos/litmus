import { Breadcrumbs, BreadcrumbsProps } from '@harness/uicore';
import React from 'react';

interface LitmusBreadCrumbsProps extends BreadcrumbsProps {
  baseUrl?: string;
}

export default function LitmusBreadCrumbs({ baseUrl, ...rest }: LitmusBreadCrumbsProps): React.ReactElement {
  return (
    <Breadcrumbs
      {...rest}
      links={[{ label: 'My Project', url: '/', iconProps: { name: 'chaos-litmuschaos' } }, ...(rest.links || [])]}
    />
  );
}
