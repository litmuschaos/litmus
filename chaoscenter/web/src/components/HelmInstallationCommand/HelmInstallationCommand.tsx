import React from 'react';
import { Layout, Text } from '@harnessio/uicore';
import CodeBlock from '@components/CodeBlock';

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
    environmentID,
    infraNamespace,
    infraScope,
    litmusURL
  } = props;

  const frontendURL = litmusURL || window.location.origin;
  const backendPort = window.location.port || '9002';
  const backendURL = window.location.protocol + '//' + window.location.hostname + ':' + backendPort;

  const helmRepoCommands = '# Add Litmus Helm repository\nhelm repo add litmuschaos https://litmuschaos.github.io/litmus-helm/\nhelm repo update';
  
  const helmInstallCommand = '# Install Chaos Infrastructure using Helm\nhelm install ' + infraName + ' litmuschaos/litmus-agent \\\n' +
    '  --namespace ' + infraNamespace + ' \\\n' +
    '  --create-namespace \\\n' +
    '  --set "INFRA_ID=' + infraID + '" \\\n' +
    '  --set "ACCESS_KEY=' + accessKey + '" \\\n' +
    '  --set "INFRA_NAME=' + infraName + '" \\\n' +
    '  --set "LITMUS_URL=' + frontendURL + '" \\\n' +
    '  --set "LITMUS_BACKEND_URL=' + backendURL + '" \\\n' +
    '  --set "LITMUS_PROJECT_ID=' + environmentID + '" \\\n' +
    '  --set "global.INFRA_MODE=' + infraScope + '"';

  const helmCommand = helmRepoCommands + '\n\n' + helmInstallCommand;
  
  const verifyCommand = 'kubectl get pods -n ' + infraNamespace;

  return (
    <Layout.Vertical spacing="small">
      <Text font={{ variation: 'body' }}>
        Install the Chaos Infrastructure on your Kubernetes cluster using Helm with the following command:
      </Text>
      
      <CodeBlock text={helmCommand} isCopyButtonEnabled />

      <Layout.Vertical spacing="xsmall" margin={{ top: 'medium' }}>
        <Text font={{ variation: 'body', weight: 'bold' }}>Prerequisites:</Text>
        <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
          <li>Helm 3.x installed on your system</li>
          <li>kubectl configured with cluster access</li>
          <li>Appropriate RBAC permissions for {infraScope} scope</li>
        </ul>
      </Layout.Vertical>

      <Layout.Vertical spacing="xsmall" margin={{ top: 'small' }}>
        <Text font={{ variation: 'body', weight: 'bold' }}>Verify Installation:</Text>
        <CodeBlock text={verifyCommand} isCopyButtonEnabled />
      </Layout.Vertical>
    </Layout.Vertical>
  );
};
