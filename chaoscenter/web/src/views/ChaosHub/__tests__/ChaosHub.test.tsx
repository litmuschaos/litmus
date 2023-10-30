import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import ChaosHub from '../ChaosHub';
import { ApolloError } from '@apollo/client';

describe('ChaosHubView Component', () => {
  const mockApolloError = new ApolloError({
    graphQLErrors: [],
    clientErrors: [],
    networkError: null,
    errorMessage: undefined
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
    listChartError: mockApolloError
  };

  it('should render without crashing', () => {
    const { getByText } = render(
      <TestWrapper>
        <ChaosHub {...mockProps} />
      </TestWrapper>
    );
    expect(getByText('chaosExperiments')).toBeInTheDocument();
  });

  it('should handle HUB_NOT_EXIST_ERROR_MESSAGE', async () => {
    const errorProps = {
      ...mockProps,
      loading: {
        listChart: false,
        listPredefinedExperiment: false
      },
      listChartError: undefined
    };
    const { getByText } = render(
      <TestWrapper>
        <ChaosHub {...errorProps} />
      </TestWrapper>
    );
    await waitFor(() => {
      expect(getByText(/genericResourceNotFoundError/)).toBeInTheDocument();
    });
  });

  it('should switch to chaosFaults tab', () => {
    const { getByText } = render(
      <TestWrapper>
        <ChaosHub {...mockProps} />
      </TestWrapper>
    );
    const tab = getByText('chaosFaults');
    fireEvent.click(tab);
    expect(tab).toHaveClass('active');
  });
});
