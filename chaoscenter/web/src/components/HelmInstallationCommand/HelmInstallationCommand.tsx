import React from 'react';
import { Layout, Text } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import CodeBlock from '@components/CodeBlock';
import { getScope } from '@utils';

export interface HelmInstallationCommandProps {
  infraID: string;
  accessKey: string;
  infraName: string;
  environmentID: string;
  infraNamespace: string;
  infraScope: 'cluster' | 'namespace';
  platformName: string;
  litmusURL?: string;
}

export const HelmInstallationCommand: React.FC<HelmInstallationCommandProps> = (props) => {
  const {
    infraID,
    accessKey,
    infraName,
    infraNamespace,
    infraScope,
    litmusURL,
  } = props;

  const { projectID } = getScope();

  const frontendURL = litmusURL || window.location.origin;
  const backendURL = `${window.location.origin}/api`;

  const helmRepoCommands = '# Add Litmus Helm repository\nhelm repo add litmuschaos https://litmuschaos.github.io/litmus-helm/\nhelm repo update';
  
  const helmInstallCommand = '# Install Chaos Infrastructure using Helm\nhelm install ' + infraName + ' litmuschaos/litmus-agent \\\n' +
    '  --namespace ' + infraNamespace + ' \\\n' +
    '  --create-namespace \\\n' +
    '  --set "INFRA_ID=' + infraID + '" \\\n' +
    '  --set "ACCESS_KEY=' + accessKey + '" \\\n' +
    '  --set "INFRA_NAME=' + infraName + '" \\\n' +
    '  --set "LITMUS_URL=' + frontendURL + '" \\\n' +
    '  --set "LITMUS_BACKEND_URL=' + backendURL + '" \\\n' +
    '  --set "LITMUS_PROJECT_ID=' + projectID + '" \\\n' +
    '  --set "global.INFRA_MODE=' + infraScope + '"';

  const helmCommand = helmRepoCommands + '\n\n' + helmInstallCommand;
  
  const verifyCommand = 'kubectl get pods -n ' + infraNamespace;

  return (
    <Layout.Vertical spacing="small">
      <Text font={{ variation: FontVariation.BODY1 }}>
        Install the Chaos Infrastructure on your Kubernetes cluster using Helm with the following command:
      </Text>
      
      <CodeBlock text={helmCommand} isCopyButtonEnabled />

      <Layout.Vertical spacing="xsmall" margin={{ top: 'medium' }}>
        <Text font={{ variation: FontVariation.BODY1, weight: 'bold' }}>Prerequisites:</Text>
        <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
          <li>Helm 3.x installed on your system</li>
          <li>kubectl configured with cluster access</li>
          <li>Appropriate RBAC permissions for {infraScope} scope</li>
        </ul>
      </Layout.Vertical>

      <Layout.Vertical spacing="xsmall" margin={{ top: 'small' }}>
        <Text font={{ variation: FontVariation.BODY1, weight: 'bold' }}>Verify Installation:</Text>
        <CodeBlock text={verifyCommand} isCopyButtonEnabled />
      </Layout.Vertical>
    </Layout.Vertical>
  );
};
