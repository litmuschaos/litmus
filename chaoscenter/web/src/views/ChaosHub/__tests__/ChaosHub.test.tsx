import React from 'react';
import '@testing-library/jest-dom';
import { render, fireEvent, screen } from '@testing-library/react';
import { ApolloError } from '@apollo/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TestWrapper } from 'utils/testUtils';
import ChaosHub from '../ChaosHub';

const queryClient = new QueryClient();

describe('ChaosHubView Component', () => {
  const mockApolloError = new ApolloError({
    graphQLErrors: [],
    clientErrors: [],
    networkError: null,
    errorMessage: 'mongo: no documents in result'
  });

  const mockProps = {
    categories: {
      predefinedCategories: new Map(),
      faultCategories: new Map()
    },
    loading: {
      listPredefinedExperiment: false,
      listChart: false
    },
    listChartError: undefined
  };

  test('should render without crashing', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TestWrapper>
          <ChaosHub {...mockProps} />
        </TestWrapper>
      </QueryClientProvider>
    );
    const chaosExperimentsTab = await screen.findByRole('tab', { name: /chaosExperiments/i });
    expect(chaosExperimentsTab).toBeInTheDocument();

    const chaosExperimentsText = await screen.findByText(/chaosExperiments/i);
    expect(chaosExperimentsText).toBeInTheDocument();
  });

  test('should handle HUB_NOT_EXIST_ERROR_MESSAGE', async () => {
    const errorProps = {
      ...mockProps,
      loading: {
        listChart: false,
        listPredefinedExperiment: false
      },
      listChartError: mockApolloError
    };
    render(
      <QueryClientProvider client={queryClient}>
        <TestWrapper>
          <ChaosHub {...errorProps} />
        </TestWrapper>
      </QueryClientProvider>
    );
    const errorMessageElement = await screen.findByText(/genericResourceNotFoundError/i);
    expect(errorMessageElement).toBeInTheDocument();
  });

  test('should switch to chaosFaults tab', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <TestWrapper>
          <ChaosHub {...mockProps} />
        </TestWrapper>
      </QueryClientProvider>
    );
    const tab = await screen.findByText(/chaosFaults/i);
    fireEvent.click(tab);
    expect(tab).toHaveClass('bp3-tab');
  });
});
