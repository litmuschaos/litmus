import React from 'react';
import { fireEvent, render, RenderResult, screen } from '@testing-library/react';
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
              description: 'Deletes Kubernetes pods',
              displayName: 'Pod Delete',
              name: 'pod-delete'
            },
            {
              description: 'Kills a container within a pod',
              displayName: 'Container Kill',
              name: 'container-kill'
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
              description: 'Stops EC2 instances',
              displayName: 'EC2 Stop',
              name: 'ec2-stop'
            }
          ]
        }
      }
    ]
  } as React.ComponentProps<typeof ChaosFaults>['hubDetails'];

  const mockProps: React.ComponentProps<typeof ChaosFaults> = {
    faultCategories: new Map([
      ['Kubernetes', 2],
      ['AWS', 1]
    ]),
    hubDetails: mockHubDetails,
    loading: {
      listChart: false
    },
    searchValue: ''
  };

  const renderComponent = (): RenderResult =>
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

    const podDeleteLink = screen.getByRole('link', {
      name: /pod delete/i
    });
    const containerKillLink = screen.getByRole('link', {
      name: /container kill/i
    });
    const ec2StopLink = screen.getByRole('link', {
      name: /ec2 stop/i
    });

    expect(podDeleteLink).toHaveAttribute('href', expect.stringContaining('chartName=kubernetes'));
    expect(containerKillLink).toHaveAttribute('href', expect.stringContaining('chartName=kubernetes'));
    expect(ec2StopLink).toHaveAttribute('href', expect.stringContaining('chartName=aws'));

    expect(podDeleteLink).toHaveAttribute('href', expect.stringContaining('hubName=testHub'));
    expect(podDeleteLink).toHaveAttribute('href', expect.stringContaining('isDefault=true'));
    expect(podDeleteLink).toHaveAttribute('href', expect.stringContaining('hub-123'));
  });

  test('should filter faults using mapped chart tags', () => {
    renderComponent();

    fireEvent.click(screen.getByText('AWS'));

    expect(screen.getByText('EC2 Stop')).toBeInTheDocument();
    expect(screen.queryByText('Pod Delete')).not.toBeInTheDocument();
    expect(screen.queryByText('Container Kill')).not.toBeInTheDocument();

    fireEvent.click(screen.getByText('Kubernetes'));

    expect(screen.getByText('Pod Delete')).toBeInTheDocument();
    expect(screen.getByText('Container Kill')).toBeInTheDocument();
    expect(screen.queryByText('EC2 Stop')).not.toBeInTheDocument();
  });
});
