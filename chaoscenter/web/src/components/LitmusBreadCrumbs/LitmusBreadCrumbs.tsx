import { Breadcrumbs, BreadcrumbsProps } from '@harnessio/uicore';
import React from 'react';
import { useAppStore } from '@context';

interface LitmusBreadCrumbsProps extends BreadcrumbsProps {
  baseUrl?: string;
}

export default function LitmusBreadCrumbs({ baseUrl, ...rest }: LitmusBreadCrumbsProps): React.ReactElement {
  const { projectName } = useAppStore();

  const combinedLinks = [
    {
      label: projectName || 'My Project',
      url: '/',
      iconProps: { name: 'chaos-litmuschaos' as any } // cast to 'any' to avoid TS type issue
    },
    ...(rest.links || [])
  ];

  const validLinks = combinedLinks.filter(link => link && typeof link.label === 'string' && link.label.trim() !== '');

  return <Breadcrumbs {...rest} links={validLinks} />;
}
