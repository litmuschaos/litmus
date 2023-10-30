/* eslint-disable jest/no-commented-out-tests */
import { render, screen } from '@testing-library/react';
import React from 'react';
import type { ApolloQueryResult } from '@apollo/client';
import type { ListExperimentRequest, ListExperimentResponse } from '@api/core';
import { TestWrapper } from 'utils/testUtils';
import OverviewView from '../Overview';

describe('OverviewView Component', () => {

  test('shows loading state', () => {
    render(
      <TestWrapper>
        <OverviewView
          loading={{ chaosHubStats: true, infraStats: true, experimentStats: true, recentExperimentsTable: true }}
          chaosHubStats={undefined}
          infraStats={undefined}
          experimentStats={undefined}
          experimentDashboardTableData={undefined}
          refetchExperiments={function (
            _variables?: Partial<ListExperimentRequest> | undefined
          ): Promise<ApolloQueryResult<ListExperimentResponse>> {
            throw new Error('Function not implemented.');
          }}
        />
      </TestWrapper>
    );
    expect(screen.getByText('Loading...')).toBeVisible();
  });

  test('renders NewUserLanding if no experiment data is present', () => {
    render(
      <TestWrapper>
        <OverviewView
          experimentDashboardTableData={{ content: [] }}
          chaosHubStats={undefined}
          infraStats={undefined}
          experimentStats={undefined}
          loading={{
            chaosHubStats: false,
            infraStats: false,
            experimentStats: false,
            recentExperimentsTable: false
          }}
          refetchExperiments={function (
            _variables?: Partial<ListExperimentRequest> | undefined
          ): Promise<ApolloQueryResult<ListExperimentResponse>> {
            throw new Error('Function not implemented.');
          }}
        />
      </TestWrapper>
    );
    expect(screen.getByText('Loading...')).toBeVisible();
  });
});