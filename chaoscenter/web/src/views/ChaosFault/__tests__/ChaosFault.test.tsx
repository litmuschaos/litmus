import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/';
import type { FaultDetails } from '@api/core';
import type { PredefinedExperiment } from '@api/entities';
import { TestWrapper } from 'utils/testUtils';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import ChaosFaultView from '../ChaosFault';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ hubID: '123', faultName: 'faultTest' }),
  useSearchParams: () => new URLSearchParams('hubName=testHub&isDefault=true')
}));

beforeAll(() =>
  window.history.pushState(
    {},
    'Chaos Fault',
    '/chaos-hubs/6f39cea9-6264-4951-83a8-29976b614289/fault/aws/ecs-instance-stop'
  )
);
describe('<ChaosFaultView />', () => {
  interface ChaosFaultViewProps {
    faultDetails: FaultDetails | undefined;
    chartName: string;
    loading: {
      getHubFaults: boolean;
      getHubExperiment: boolean;
    };
    experiments: Array<PredefinedExperiment>;
  }
  const defaultProps: ChaosFaultViewProps = {
    faultDetails: undefined,
    chartName: 'TestChart',
    loading: { getHubFaults: true, getHubExperiment: true },
    experiments: []
  };
  const breadcrumbs = [
    {
      label: 'ChaosHub',
      url: '/chaoshub'
    },
    {
      label: 'Faults',
      url: '/faults'
    }
  ];
  const renderComponent = (props = defaultProps) =>
    render(
      <TestWrapper>
        <DefaultLayoutTemplate title={'Chaos Fault'} breadcrumbs={breadcrumbs}>
          <ChaosFaultView {...props} />
        </DefaultLayoutTemplate>
      </TestWrapper>
    );

  test('displays error when no fault details', () => {
    const errorProps = {
      ...defaultProps,
      faultDetails: undefined,
      loading: { getHubFaults: false, getHubExperiment: false }
    };
    renderComponent(errorProps);
    expect(screen.getByText('genericResourceNotFoundError')).toBeInTheDocument();
  });
});
