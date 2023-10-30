import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import type { MutationFunction, ApolloQueryResult } from '@apollo/client';
import type {
  DeleteChaosHubResponse,
  DeleteChaosHubRequest,
  SyncChaosHubResponse,
  SyncChaosHubRequest,
  ListChaosHubRequest,
  ListChaosHubResponse
} from '@api/core';
import { AuthType, type ChaosHub } from '@api/entities';
import { ChaosHubMenuView } from '../ChaosHubMenu';

// Mock external dependencies
jest.mock('@harnessio/uicore', () => ({}));
jest.mock('@blueprintjs/core', () => ({}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn()
  })
}));
jest.mock('@hooks', () => ({
  useRouteWithBaseUrl: () => jest.fn()
}));
jest.mock('@strings', () => ({
  useStrings: () => ({
    getString: jest.fn().mockImplementation(key => key)
  })
}));
jest.mock('@api/entities', () => ({}));

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
      authType: AuthType.NONE,
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
      <MemoryRouter>
        <ChaosHubMenuView {...defaultProps} {...props} />
      </MemoryRouter>
    );

  test('renders menu items correctly', () => {
    renderComponent();
    expect(screen.getByTestId('menu')).toBeInTheDocument();
    expect(screen.getAllByTestId('menuItem')).toHaveLength(4);
  });

  test('handles click on sync hub menu item', () => {
    renderComponent();
    fireEvent.click(screen.getByText('menuItems.syncHub'));
    expect(defaultProps.syncChaosHubMutation).toHaveBeenCalledWith({
      variables: { projectID: expect.anything(), id: '1' }
    });
  });

  test('does not render edit and delete options for default hub', () => {
    renderComponent({ isDefault: true });
    expect(screen.queryByText('menuItems.editHub')).not.toBeInTheDocument();
    expect(screen.queryByText('menuItems.deleteHub')).not.toBeInTheDocument();
  });
});
