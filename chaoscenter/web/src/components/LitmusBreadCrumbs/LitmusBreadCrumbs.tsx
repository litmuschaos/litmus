import { Breadcrumbs, BreadcrumbsProps } from '@harnessio/uicore';
import React from 'react';
import { useAppStore } from '@context';

interface LitmusBreadCrumbsProps extends BreadcrumbsProps {
  baseUrl?: string;
}

export default function LitmusBreadCrumbs({ baseUrl, ...rest }: LitmusBreadCrumbsProps): React.ReactElement {
  const { projectName } = useAppStore();

  return (
    <Breadcrumbs
      {...rest}
      links={[
        { label: projectName || 'My Project', url: '/', iconProps: { name: 'chaos-litmuschaos' } },
        ...(rest.links || [])
      ]}
    />
  );
}
