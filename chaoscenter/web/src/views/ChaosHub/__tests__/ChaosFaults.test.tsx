import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestWrapper } from 'utils/testUtils';
import ChaosFaults from '../ChaosFaults';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ hubID: 'hub-123' })
}));

beforeAll(() => {
  window.history.pushState({}, 'Chaos Faults', '/chaos-hubs/hub-123/faults?hubName=testHub&isDefault=true');
});

describe('ChaosFaults Component', () => {
  const mockHubDetails = {
    listChaosFaults: [
      {
        metadata: {
          name: 'kubernetes'
        },
        spec: {
          displayName: 'Kubernetes',
          faults: [
            {
              name: 'pod-delete',
              displayName: 'Pod Delete',
              description: 'Deletes Kubernetes pods'
            },
            {
              name: 'container-kill',
              displayName: 'Container Kill',
              description: 'Kills a container within a pod'
            }
          ]
        }
      },
      {
        metadata: {
          name: 'aws'
        },
        spec: {
          displayName: 'AWS',
          faults: [
            {
              name: 'ec2-stop',
              displayName: 'EC2 Stop',
              description: 'Stops EC2 instances'
            }
          ]
        }
      }
    ]
  } as any;

  const mockProps = {
    hubDetails: mockHubDetails,
    faultCategories: new Map([
      ['Kubernetes', 2],
      ['AWS', 1]
    ]),
    searchValue: '',
    loading: {
      listChart: false
    }
  };

  const renderComponent = () =>
    render(
      <TestWrapper>
        <ChaosFaults {...mockProps} />
      </TestWrapper>
    );

  test('should render fault details from multiple charts', () => {
    renderComponent();

    expect(screen.getByText('Pod Delete')).toBeInTheDocument();
    expect(screen.getByText('Deletes Kubernetes pods')).toBeInTheDocument();

    expect(screen.getByText('Container Kill')).toBeInTheDocument();
    expect(screen.getByText('Kills a container within a pod')).toBeInTheDocument();

    expect(screen.getByText('EC2 Stop')).toBeInTheDocument();
    expect(screen.getByText('Stops EC2 instances')).toBeInTheDocument();
  });

  test('should preserve chart mapping across multiple charts', () => {
    renderComponent();

    const podDeleteLink = screen.getByRole('link', { name: /pod delete/i });
    const containerKillLink = screen.getByRole('link', { name: /container kill/i });
    const ec2StopLink = screen.getByRole('link', { name: /ec2 stop/i });

    expect(podDeleteLink).toHaveAttribute('href', expect.stringContaining('chartName=kubernetes'));
    expect(containerKillLink).toHaveAttribute('href', expect.stringContaining('chartName=kubernetes'));
    expect(ec2StopLink).toHaveAttribute('href', expect.stringContaining('chartName=aws'));

    expect(podDeleteLink).toHaveAttribute('href', expect.stringContaining('hubName=testHub'));
    expect(podDeleteLink).toHaveAttribute('href', expect.stringContaining('isDefault=true'));
    expect(podDeleteLink).toHaveAttribute('href', expect.stringContaining('hub-123'));
  });
});
