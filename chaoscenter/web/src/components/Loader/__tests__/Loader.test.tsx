import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import { Loader } from '../Loader';

describe('Loader', () => {
  test('renders spinner and default loading message when loading is true', () => {
    render(
      <TestWrapper>
        <Loader loading={true} testId="loader">
          <div>Content</div>
        </Loader>
      </TestWrapper>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.getByText('loading')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  test('renders custom message when provided', () => {
    render(
      <TestWrapper>
        <Loader loading={true} message="Fetching experiments..." testId="loader">
          <div>Content</div>
        </Loader>
      </TestWrapper>
    );

    expect(screen.getByText('Fetching experiments...')).toBeInTheDocument();
  });

  test('renders children when loading is false and no noData condition', () => {
    render(
      <TestWrapper>
        <Loader loading={false}>
          <div>Content</div>
        </Loader>
      </TestWrapper>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('renders NoDataCard when loading is false and noData.when() returns true', () => {
    render(
      <TestWrapper>
        <Loader
          loading={false}
          testId="loader"
          noData={{
            when: () => true,
            message: 'No data found'
          }}
        >
          <div>Content</div>
        </Loader>
      </TestWrapper>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
    expect(screen.queryByText('Content')).not.toBeInTheDocument();
  });

  test('renders children when loading is false and noData.when() returns false', () => {
    render(
      <TestWrapper>
        <Loader
          loading={false}
          noData={{
            when: () => false,
            message: 'No data found'
          }}
        >
          <div>Content</div>
        </Loader>
      </TestWrapper>
    );

    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  test('applies small spacing class when small prop is true', () => {
    render(
      <TestWrapper>
        <Loader loading={true} small testId="loader">
          <div>Content</div>
        </Loader>
      </TestWrapper>
    );

    expect(screen.getByTestId('loader')).toBeInTheDocument();
  });
});
