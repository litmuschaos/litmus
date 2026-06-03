import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestWrapper } from 'utils/testUtils';
import ChaosFaults from '../ChaosFaults';

describe('ChaosFaults Component', () => {
  const mockHubDetails = {
    listChaosFaults: [
      {
        metadata: {
          name: 'kubernetes'
        },
        spec: {
          displayName: 'Kubernetes',
          faults: [
            {
              name: 'pod-delete',
              displayName: 'Pod Delete',
              description: 'Deletes Kubernetes pods'
            }
          ]
        }
      }
    ]
  } as any;

  const mockProps = {
    hubDetails: mockHubDetails,
    faultCategories: new Map([['Kubernetes', 1]]),
    searchValue: '',
    loading: {
      listChart: false
    }
  };

  const renderComponent = () =>
    render(
      <TestWrapper>
        <ChaosFaults {...mockProps} />
      </TestWrapper>
    );

  test('should render fault details', () => {
    renderComponent();

    expect(screen.getByText('Pod Delete')).toBeInTheDocument();
    expect(screen.getByText('Deletes Kubernetes pods')).toBeInTheDocument();
  });

  test('should include chartName in fault links', () => {
    renderComponent();

    const link = screen.getByRole('link', {
      name: /pod delete/i
    });

    expect(link).toHaveAttribute('href', expect.stringContaining('chartName=kubernetes'));
  });
});
