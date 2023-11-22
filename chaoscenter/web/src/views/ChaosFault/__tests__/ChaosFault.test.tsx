import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom/';
import type { FaultDetails } from '@api/core';
import type { PredefinedExperiment } from '@api/entities';
import ChaosFaultView from '../ChaosFault';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ hubID: '123', faultName: 'faultTest' }),
  useSearchParams: () => new URLSearchParams('hubName=testHub&isDefault=true')
}));

jest.mock('@hooks', () => ({
  ...jest.requireActual('@hooks'), // if you want to keep other hooks unmocked
  useAppStore: () => ({ projectID: 'mock-project-id' }),
  useRouteWithBaseUrl: () => ({
    toChaosHubs: () => '/chaoshubs',
    toChaosHub: () => '/chaoshub',
    toRoot: () => '/'
  })
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
    loading: { getHubFaults: true, getHubExperiment: true },
    experiments: []
  };

  const renderComponent = (props = defaultProps) =>
    render(
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
    
      <DefaultLayoutTemplate title={"Chaos Fault"} breadcrumbs={breadcrumbs}>
        <ChaosFaultView {...props} />
      </MemoryRouter>
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
