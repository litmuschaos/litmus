import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MockedProvider } from '@apollo/react-testing';
import { TestWrapper } from 'utils/testUtils';
import { ListChaosHubResponse, syncChaosHub } from '@api/core';
import { AuthType } from '@api/entities';
import ChaosHubsView from '..';

const listChaosHubResponse: ListChaosHubResponse['listChaosHub'] = [
  {
    id: '6f39cea9-6264-4951-83a8-29976b614289',
    name: 'Enterprise ChaosHub',
    repoURL: 'https://github.com/wings-software/enterprise-chaos-hub',
    isAvailable: true,
    totalExperiments: '89',
    lastSyncedAt: '',
    authType: AuthType.TOKEN,
    tags: [''],
    createdAt: '1669617604',
    updatedAt: '1669617604',
    totalFaults: '89',
    repoBranch: 'main',
    isDefault: true,
    projectID: ''
  },
  {
    id: 'e4fc6906-bf4f-43e1-929a-c82f9c7e95e2',
    name: 'a brand new hub',
    repoURL: 'https://github.com/S-ayanide/DemoChart',
    isAvailable: false,
    lastSyncedAt: '1669617604',
    authType: AuthType.TOKEN,
    tags: [''],
    createdAt: '1669617604',
    updatedAt: '1669617604',
    totalExperiments: '30',
    totalFaults: '5',
    repoBranch: 'master',
    isDefault: false,
    projectID: ''
  }
];

beforeAll(() => window.history.pushState({}, 'Chaos Hubs', '/chaos-hubs'));

describe('Chaos Hubs View', () => {
  test('should render loader when APIs are not resolved', () => {
    const setSearchTerm = jest.fn();
    const mockedSyncChaosHub = syncChaosHub as jest.Mock;

    const props = {
      chaosHubs: listChaosHubResponse,
      syncChaosHubMutation: mockedSyncChaosHub,
      loading: {
        listChaosHub: true,
        syncChaosHub: true
      },
      searchTerm: '',
      setSearchTerm: setSearchTerm,
      listChaosHubRefetch: Promise.resolve
    };

    render(
      <TestWrapper>
        <MockedProvider addTypename={false}>
          <ChaosHubsView {...props} />
        </MockedProvider>
      </TestWrapper>
    );

    expect(screen.getByText('Loading, please wait...')).toBeInTheDocument();
  });

  test('should render correct CSS properties', () => {
    const setSearchTerm = jest.fn();
    const mockedSyncChaosHub = syncChaosHub as jest.Mock;

    const props = {
      chaosHubs: listChaosHubResponse,
      syncChaosHubMutation: mockedSyncChaosHub,
      loading: {
        listChaosHub: false,
        syncChaosHub: false
      },
      searchTerm: '',
      setSearchTerm: setSearchTerm,
      listChaosHubRefetch: Promise.resolve
    };

    const { getByTestId, getAllByTestId } = render(
      <TestWrapper>
        <MockedProvider addTypename={false}>
          <ChaosHubsView {...props} />
        </MockedProvider>
      </TestWrapper>
    );

    const child = getByTestId('hubContainer').getElementsByTagName('div');

    expect(getByTestId('hubContainer').firstChild).toHaveClass('StyledProps--font-variation-h6');
    expect(child[0]).toHaveClass('cardsMainContainer');
    expect(child[1]).toHaveClass('chaosHubCard');
    expect(getAllByTestId('chip')[0]).toHaveClass('chipCard default');
    expect(getAllByTestId('chip')[1]).toHaveClass('chipCard private');
  });

  test('should render chaoshub data when API is resolved', () => {
    const setSearchTerm = jest.fn();
    const mockedSyncChaosHub = syncChaosHub as jest.Mock;

    const props = {
      chaosHubs: listChaosHubResponse,
      syncChaosHubMutation: mockedSyncChaosHub,
      loading: {
        listChaosHub: false,
        syncChaosHub: false
      },
      searchTerm: '',
      setSearchTerm: setSearchTerm,
      listChaosHubRefetch: Promise.resolve
    };

    const { getByTestId } = render(
      <TestWrapper>
        <MockedProvider addTypename={false}>
          <ChaosHubsView {...props} />
        </MockedProvider>
      </TestWrapper>
    );

    expect(getByTestId('hubContainer').firstChild).toHaveTextContent('totalChaosHubs (2)');
    expect(screen.getByText('Enterprise ChaosHub')).toBeInTheDocument();
    expect(screen.getByText('a brand new hub')).toBeInTheDocument();
    expect(screen.getByText('faults: 89')).toBeInTheDocument();
    expect(screen.getByText('experiments: 89')).toBeInTheDocument();
  });

  test('should render default Enterprise Hub', () => {
    const setSearchTerm = jest.fn();
    const mockedSyncChaosHub = syncChaosHub as jest.Mock;

    const props = {
      chaosHubs: listChaosHubResponse,
      syncChaosHubMutation: mockedSyncChaosHub,
      loading: {
        listChaosHub: false,
        syncChaosHub: false
      },
      searchTerm: '',
      setSearchTerm: setSearchTerm,
      listChaosHubRefetch: Promise.resolve
    };

    const { getByTestId, getAllByTestId } = render(
      <TestWrapper>
        <MockedProvider addTypename={false}>
          <ChaosHubsView {...props} />
        </MockedProvider>
      </TestWrapper>
    );

    const image = getByTestId('hubContainer').getElementsByTagName('img')[0];

    expect(screen.getByText('Enterprise ChaosHub')).toBeInTheDocument();
    expect(screen.getByText('faults: 89')).toBeInTheDocument();
    expect(screen.getByText('experiments: 89')).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Enterprise Hub');
    expect(getAllByTestId('chip')[0]).toHaveClass('chipCard default');
  });

  test('should render custom Hub', () => {
    const setSearchTerm = jest.fn();
    const mockedSyncChaosHub = syncChaosHub as jest.Mock;

    const props = {
      chaosHubs: listChaosHubResponse,
      syncChaosHubMutation: mockedSyncChaosHub,
      loading: {
        listChaosHub: false,
        syncChaosHub: false
      },
      searchTerm: '',
      setSearchTerm: setSearchTerm,
      listChaosHubRefetch: Promise.resolve
    };

    const { getByTestId, getAllByTestId } = render(
      <TestWrapper>
        <MockedProvider addTypename={false}>
          <ChaosHubsView {...props} />
        </MockedProvider>
      </TestWrapper>
    );

    const image = getByTestId('hubContainer').getElementsByTagName('img')[1];

    expect(screen.getByText('Enterprise ChaosHub')).toBeInTheDocument();
    expect(screen.getByText('faults: 89')).toBeInTheDocument();
    expect(screen.getByText('experiments: 89')).toBeInTheDocument();
    expect(image).toHaveAttribute('alt', 'Private Hub');
    expect(getAllByTestId('chip')[1]).toHaveClass('chipCard private');
  });
});
