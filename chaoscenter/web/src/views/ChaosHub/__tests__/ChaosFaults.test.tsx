import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TestWrapper } from 'utils/testUtils';
import ChaosFaults from '../ChaosFaults';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ hubID: 'hub-123' })
}));

beforeAll(() => {
  window.history.pushState({}, 'Chaos Faults', '/chaos-hubs/hub-123/faults?hubName=testHub&isDefault=true');
});

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

  test('should include chart information in fault links', () => {
    renderComponent();

    const link = screen.getByRole('link', {
      name: /pod delete/i
    });

    expect(link).toHaveAttribute('href', expect.stringContaining('chartName=kubernetes'));

    expect(link).toHaveAttribute('href', expect.stringContaining('hubName=testHub'));

    expect(link).toHaveAttribute('href', expect.stringContaining('isDefault=true'));

    expect(link).toHaveAttribute('href', expect.stringContaining('hub-123'));
  });
});
