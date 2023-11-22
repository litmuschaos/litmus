import '@testing-library/jest-dom';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import type { ApolloError, ApolloQueryResult, MutationFunction } from '@apollo/client';
import { TestWrapper } from 'utils/testUtils';
import type {
  ListKubernetesChaosInfrastructureRequest,
  ListKubernetesChaosInfrastructureResponse,
  DeleteKubernetesChaosInfraResponse,
  DeleteKubernetesChaosInfraRequest
} from '@api/core';
import type { GetEnvironmentResponse } from '@api/core/environments';
import type { KubernetesChaosInfrastructure } from '@api/entities';
import KubernetesChaosInfrastructureView from '../KubernetesChaosInfrastructure';

jest.mock('@strings', () => ({
  useStrings: () => ({
    getString: jest.fn().mockImplementation(id => id)
  })
}));

interface KubernetesChaosInfrastructureViewProps {
  chaosInfrastructures: Array<KubernetesChaosInfrastructure> | undefined;
  environmentDetails: GetEnvironmentResponse | undefined;
  loading: {
    listChaosInfrastructure: boolean;
    getEnvironmentLoading: boolean;
  };
  error: {
    getEnvironmentError: ApolloError | undefined;
    listChaosInfrastructureError: ApolloError | undefined;
  };
  refetch: {
    listChaosInfra: (
      variables?: Partial<ListKubernetesChaosInfrastructureRequest> | undefined
    ) => Promise<ApolloQueryResult<ListKubernetesChaosInfrastructureResponse>>;
  };
  environmentID: string;
  deleteChaosInfrastructureMutation: MutationFunction<
    DeleteKubernetesChaosInfraResponse,
    DeleteKubernetesChaosInfraRequest
  >;
  startPolling: (pollInterval: number) => void;
  stopPolling: () => void;
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  totalInfrastructures: number;
  pagination: React.ReactElement;
}

const mockChaosInfrastructures: Array<KubernetesChaosInfrastructure> = [
  {
    platformName: 'mockPlatform',
    token: 'mockToken',
    infraID: 'mockInfraID',
    environmentID: 'mockEnvironmentID',
    isActive: true,
    isInfraConfirmed: true,
    name: 'Mock Name',
    startTime: '2023-01-01T00:00:00Z',
    version: '1.0.0',
    lastHeartbeat: '2023-01-01T01:00:00Z'
  }
];

describe('KubernetesChaosInfrastructureView', () => {
  const mockProps: KubernetesChaosInfrastructureViewProps = {
    chaosInfrastructures: mockChaosInfrastructures,
    environmentDetails: undefined,
    loading: { listChaosInfrastructure: false, getEnvironmentLoading: false },
    error: { getEnvironmentError: undefined, listChaosInfrastructureError: undefined },
    refetch: {
      listChaosInfra: jest.fn()
    },
    environmentID: 'mockEnvironmentId',
    deleteChaosInfrastructureMutation: jest.fn(),
    startPolling: jest.fn(),
    stopPolling: jest.fn(),
    searchTerm: '',
    setSearchTerm: jest.fn(),
    totalInfrastructures: 1,
    pagination: <div>Pagination Component</div>
  };

  test('renders without crashing', () => {
    const { getByText } = render(
      <TestWrapper>
        <KubernetesChaosInfrastructureView {...mockProps} />
      </TestWrapper>
    );
    expect(getByText('Pagination Component')).toBeInTheDocument();
  });

  test('displays the Kubernetes chaos infrastructure table when data is present', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <KubernetesChaosInfrastructureView {...mockProps} />
      </TestWrapper>
    );
    expect(getByTestId('kubernetes-chaos-table')).toBeInTheDocument();
  });

  test('displays no chaos infrastructure message when there is no data', () => {
    const updatedProps = { ...mockProps, chaosInfrastructures: [] };
    const { getByText } = render(
      <TestWrapper>
        <KubernetesChaosInfrastructureView {...updatedProps} />
      </TestWrapper>
    );
    expect(getByText('noChaosInfrastructure')).toBeInTheDocument();
  });

  test('updates search term on search input change', () => {
    const { getByPlaceholderText } = render(
      <TestWrapper>
        <KubernetesChaosInfrastructureView {...mockProps} />
      </TestWrapper>
    );
    const searchInput = getByPlaceholderText('search');
    fireEvent.change(searchInput, { target: { value: 'new search' } });
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('new search');
  });

  test('renders pagination component', () => {
    const { getByText } = render(
      <TestWrapper>
        <KubernetesChaosInfrastructureView {...mockProps} />
      </TestWrapper>
    );
    expect(getByText('Pagination Component')).toBeInTheDocument();
  });

  test('clears search term on clear search button click', () => {
    const updatedProps = { ...mockProps, searchTerm: 'some search term' };
    const { getByText } = render(
      <TestWrapper>
        <KubernetesChaosInfrastructureView {...updatedProps} />
      </TestWrapper>
    );
    fireEvent.click(getByText('clearSearch'));
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('');
  });
});
