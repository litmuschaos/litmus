import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { MutationFunction, ApolloQueryResult } from '@apollo/client';
import { TestWrapper } from 'utils/testUtils';
import type {
  DeleteChaosHubResponse,
  DeleteChaosHubRequest,
  SyncChaosHubResponse,
  SyncChaosHubRequest,
  ListChaosHubRequest,
  ListChaosHubResponse
} from '@api/core';
import { AuthType, type ChaosHub } from '@api/entities';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import { ChaosHubMenuView } from '../ChaosHubMenu';

describe('ChaosHubMenuView Tests', () => {
  interface ChaosHubMenuViewProps {
    chaosHub: ChaosHub;
    hubID: React.MutableRefObject<string | null>;
    deleteChaosHubMutation: MutationFunction<DeleteChaosHubResponse, DeleteChaosHubRequest>;
    syncChaosHubMutation: MutationFunction<SyncChaosHubResponse, SyncChaosHubRequest>;
    loading: {
      deleteChaosHub: boolean;
      syncChaosHub: boolean;
    };
    listChaosHubRefetch: (
      variables?: Partial<ListChaosHubRequest> | undefined
    ) => Promise<ApolloQueryResult<ListChaosHubResponse>>;
    isDefault: boolean;
  }

  const defaultProps: ChaosHubMenuViewProps = {
    chaosHub: {
      id: '1',
      name: 'Test Hub',
      isDefault: false,
      repoURL: '',
      repoBranch: '',
      projectID: '',
      authType: AuthType.SSH,
      lastSyncedAt: '',
      isAvailable: false,
      totalFaults: '',
      totalExperiments: ''
    },
    hubID: { current: null },
    loading: {
      deleteChaosHub: false,
      syncChaosHub: false
    },
    deleteChaosHubMutation: jest.fn(),
    syncChaosHubMutation: jest.fn(),
    listChaosHubRefetch: jest.fn(),
    isDefault: false
  };

  const renderComponent = (props = {}) =>
    render(
      <TestWrapper>
        <DefaultLayoutTemplate breadcrumbs={[]} title={undefined}>
          <ChaosHubMenuView {...defaultProps} {...props} />
        </DefaultLayoutTemplate>
      </TestWrapper>
    );

  test('does not render edit and delete options for default hub', () => {
    renderComponent({ isDefault: true });
    expect(screen.queryByText('menuItems.editHub')).not.toBeInTheDocument();
    expect(screen.queryByText('menuItems.deleteHub')).not.toBeInTheDocument();
  });
});
