import React from 'react';
import { render, screen } from '@testing-library/react';
import { HelmInstallationCommand } from '../HelmInstallationCommand';

const defaultProps = {
  accessKey: 'test-access-key',
  environmentID: 'test-env-id',
  infraID: 'test-infra-id',
  infraName: 'test-infra',
  infraNamespace: 'litmus',
  infraScope: 'cluster' as const,
  platformName: 'Kubernetes',
};

describe('HelmInstallationCommand', () => {
  test('renders helm repo add command', () => {
    render(<HelmInstallationCommand {...defaultProps} />);
    expect(screen.getByText(/helm repo add litmuschaos/i)).toBeInTheDocument();
  });

  test('renders infra ID in helm install command', () => {
    render(<HelmInstallationCommand {...defaultProps} />);
    expect(screen.getByText(/test-infra-id/i)).toBeInTheDocument();
  });

  test('renders access key in helm install command', () => {
    render(<HelmInstallationCommand {...defaultProps} />);
    expect(screen.getByText(/test-access-key/i)).toBeInTheDocument();
  });

  test('renders namespace in helm install command', () => {
    render(<HelmInstallationCommand {...defaultProps} />);
    expect(screen.getByText(/--namespace litmus/i)).toBeInTheDocument();
  });

  test('renders verify installation command', () => {
    render(<HelmInstallationCommand {...defaultProps} />);
    expect(screen.getByText(/kubectl get pods/i)).toBeInTheDocument();
  });
});
