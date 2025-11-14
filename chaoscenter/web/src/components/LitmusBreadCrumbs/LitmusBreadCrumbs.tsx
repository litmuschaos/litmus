import { Breadcrumbs, BreadcrumbsProps } from '@harnessio/uicore';
import React from 'react';
import { useAppStore } from '@context';
import litmusLogo from '@images/litmus-icon-color.svg';

interface LitmusBreadCrumbsProps extends BreadcrumbsProps {
  baseUrl?: string;
}

export default function LitmusBreadCrumbs({ baseUrl, ...rest }: LitmusBreadCrumbsProps): React.ReactElement {
  const { projectName } = useAppStore();

  const combinedLinks = [
    {
      label: projectName || 'My Project',
      url: '/',
      icon: <img src={litmusLogo} alt="Litmus" style={{ width: '16px', height: '16px', marginRight: '8px' }} />
    },
    ...(rest.links || [])
  ];

  const validLinks = combinedLinks.filter(link => link && typeof link.label === 'string' && link.label.trim() !== '');

  return <Breadcrumbs {...rest} links={validLinks} />;
}
