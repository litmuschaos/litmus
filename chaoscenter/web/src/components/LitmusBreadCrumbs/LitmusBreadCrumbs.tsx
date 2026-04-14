import { Breadcrumbs, BreadcrumbsProps } from '@harnessio/uicore';
import React from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '@context';

interface LitmusBreadCrumbsProps extends BreadcrumbsProps {
  baseUrl?: string;
}

export default function LitmusBreadCrumbs({ baseUrl, ...rest }: LitmusBreadCrumbsProps): React.ReactElement {
  const { projectName, projectID } = useAppStore();
  const { accountID } = useParams<{ accountID: string }>();

  const projectUrl =
    projectID && projectID.trim() !== ''
      ? `/account/${accountID}/project/${projectID}/dashboard`
      : `/account/${accountID}/settings/projects`;

  const combinedLinks = [
    {
      label: projectName || 'My Project',
      url: projectUrl,
      iconProps: { name: 'chaos-litmuschaos' as any } // cast to 'any' to avoid TS type issue
    },
    ...(rest.links || [])
  ];

  const validLinks = combinedLinks.filter(link => link && typeof link.label === 'string' && link.label.trim() !== '');

  return <Breadcrumbs {...rest} links={validLinks} />;
}
