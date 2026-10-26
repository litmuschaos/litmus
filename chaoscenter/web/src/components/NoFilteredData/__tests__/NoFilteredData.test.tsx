import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import NoFilteredData from '../NoFilteredData';

const props = {
  height: '300px'
};

describe('NoFilteredData tests', () => {
  test('should have correct CSS properties', () => {
    const { container } = render(
      <TestWrapper>
        <NoFilteredData {...props} />
      </TestWrapper>
    );

    const paragraphs = container.getElementsByTagName('p');

    expect(container.firstChild).toHaveClass('noFilteredData');
    expect(paragraphs[0]).toHaveClass('title');
    expect(paragraphs[1]).toHaveClass('subtitle');
  });

  test('should render the correct text', () => {
    const { container } = render(
      <TestWrapper>
        <NoFilteredData {...props} />
      </TestWrapper>
    );

    const paragraphs = container.getElementsByTagName('p');

    expect(paragraphs[0]).toHaveTextContent('noFilteredData.title');
    expect(paragraphs[1]).toHaveTextContent('noFilteredData.subtitle');
  });
});
