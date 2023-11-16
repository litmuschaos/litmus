import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import OverviewView from '../Overview';

const NoExperimentProps = {
  chaosHubStats: undefined,
  experimentDashboardTableData: { content: [] },
  experimentStats: undefined,
  infraStats: undefined,
  loading: {
    experimentStats: false,
    chaosHubStats: false,
    infraStats: false,
    recentExperimentsTable: false,
  },
  refetchExperiments: Promise.resolve,
};

const props = {
  loading: {
    chaosHubStats: true,
    experimentStats: true,
    infraStats: true,
    recentExperimentsTable: true,
  },
  chaosHubStats: undefined,
  infraStats: undefined,
  experimentStats: undefined,
  experimentDashboardTableData: undefined,
  refetchExperiments: Promise.resolve,
};
describe('OverviewView Component', () => {
  test('shows loading state', async () => {
    render(
      <TestWrapper>
        <OverviewView {...props} />
      </TestWrapper>
    );
    const loadingText = await screen.findByText('litmus');
    expect(loadingText).toBeVisible();
  });

  test('renders NewUserLanding if no experiment data is present', async () => {
    render(
      <TestWrapper>
        <OverviewView {...NoExperimentProps} />
      </TestWrapper>
    );
    const loadingText = await screen.findByText('litmus');
    expect(loadingText).toBeVisible();
  });
});
