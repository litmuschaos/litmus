import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { HelmInstallationCommand } from '../HelmInstallationCommand';

const defaultProps = {
  infraID: 'test-infra-id',
  accessKey: 'test-access-key',
  infraName: 'test-infra',
  environmentID: 'test-env-id',
  infraNamespace: 'litmus',
  infraScope: 'cluster' as const,
  platformName: 'Kubernetes'
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
