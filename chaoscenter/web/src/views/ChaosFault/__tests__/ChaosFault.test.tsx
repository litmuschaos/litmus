import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import type { FaultDetails } from '@api/core';
import type { PredefinedExperiment } from '@api/entities';
import ChaosFaultView from '../ChaosFault';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ hubID: '123', faultName: 'faultTest' }),
  useSearchParams: () => new URLSearchParams('hubName=testHub&isDefault=true')
}));

jest.mock('@hooks', () => ({
  useRouteWithBaseUrl: () => ({ toChaosHubs: () => '/chaoshubs', toChaosHub: () => '/chaoshub' })
}));

jest.mock('@strings', () => ({
  useStrings: () => ({ getString: (key: any) => key })
}));

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
    loading: { getHubFaults: false, getHubExperiment: false },
    experiments: []
  };

  const renderComponent = (props = defaultProps) =>
    render(
      <MemoryRouter>
        <ChaosFaultView {...props} />
      </MemoryRouter>
    );

  test('renders with default props', () => {
    renderComponent();
    expect(screen.getByText('chaoshubs')).toBeInTheDocument();
  });

  test('displays loader when loading data', () => {
    const loadingProps = { ...defaultProps, loading: { getHubFaults: true, getHubExperiment: true } };
    renderComponent(loadingProps);
    expect(screen.getByTestId('experiment-loader')).toBeInTheDocument();
  });

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
