import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { ApolloQueryResult } from '@apollo/client';
import { QueryClient } from '@tanstack/query-core';
import { QueryClientProvider } from '@tanstack/react-query';
import type { ListExperimentRequest, ListExperimentResponse } from '@api/core';
import { TestWrapper } from 'utils/testUtils';
import OverviewView from '../Overview';

const queryClient = new QueryClient();

describe('OverviewView Component', () => {
  test('shows loading state', async () => {
    const props = {
      loading: {
        chaosHubStats: true,
        infraStats: true,
        experimentStats: true,
        recentExperimentsTable: true
      },
      chaosHubStats: undefined,
      infraStats: undefined,
      experimentStats: undefined,
      experimentDashboardTableData: undefined,
      refetchExperiments: function (
        _variables?: Partial<ListExperimentRequest> | undefined
      ): Promise<ApolloQueryResult<ListExperimentResponse>> {
        throw new Error('Function not implemented.');
      }
    };
    render(
      <QueryClientProvider client={queryClient}>
        <TestWrapper>
          <OverviewView {...props} />
        </TestWrapper>
      </QueryClientProvider>
    );
    const loadingText = await screen.findByText('litmus');
    expect(loadingText).toBeVisible();
  });

  test('renders NewUserLanding if no experiment data is present', async () => {
    const props = {
      experimentDashboardTableData: { content: [] },
      chaosHubStats: undefined,
      infraStats: undefined,
      experimentStats: undefined,
      loading: {
        chaosHubStats: false,
        infraStats: false,
        experimentStats: false,
        recentExperimentsTable: false
      },
      refetchExperiments: function (
        _variables?: Partial<ListExperimentRequest> | undefined
      ): Promise<ApolloQueryResult<ListExperimentResponse>> {
        throw new Error('Function not implemented.');
      }
    };

    render(
      <QueryClientProvider client={queryClient}>
        <TestWrapper>
          <OverviewView {...props} />
        </TestWrapper>
      </QueryClientProvider>
    );
    const loadingText = await screen.findByText('litmus');
    expect(loadingText).toBeVisible();
  });
});
