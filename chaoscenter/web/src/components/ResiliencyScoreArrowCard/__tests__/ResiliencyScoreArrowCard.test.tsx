import React from 'react';
import '@testing-library/jest-dom/extend-expect';
import { render } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import ResiliencyScoreArrowCard from '../ResiliencyScoreArrowCard';

describe('Resiliency Score Arrow Card', () => {
  test('should render the component', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ResiliencyScoreArrowCard score={10} title="test title" />
      </TestWrapper>
    );
    expect(getByTestId('resiliencyScoreArrowCardContainer')).toBeInTheDocument();
  });
  test('should render correct container classnames and values', () => {
    const score = Math.floor(Math.random() * 100) + 1;
    const { getByTestId } = render(
      <TestWrapper>
        <ResiliencyScoreArrowCard score={score} title="test title" fullWidth />
      </TestWrapper>
    );
    if (score > 79) {
      expect(getByTestId('resiliencyScoreArrowCardContainer')).toHaveClass('green');
    } else if (score <= 79 && score > 39) {
      expect(getByTestId('resiliencyScoreArrowCardContainer')).toHaveClass('yellow');
    } else {
      expect(getByTestId('resiliencyScoreArrowCardContainer')).toHaveClass('red');
    }
    expect(getByTestId('resiliencyScoreArrowCardContainer')).toHaveClass('fullWidth');
    expect(getByTestId('resiliencyScoreArrowCardTitle')).toHaveTextContent('test title');
    expect(getByTestId('resiliencyScoreArrowCardScore')).toHaveTextContent(`${score}%`);
  });
  test('when score is undefined', () => {
    const { getByTestId } = render(
      <TestWrapper>
        <ResiliencyScoreArrowCard score={undefined} title="test title" fullWidth />
      </TestWrapper>
    );
    expect(getByTestId('resiliencyScoreArrowCardScore')).toHaveTextContent('--');
  });
});
