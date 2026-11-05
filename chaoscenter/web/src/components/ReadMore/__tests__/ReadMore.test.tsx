import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import ReadMore from '../ReadMore';

describe('ReadMore', () => {
  const shortText = 'This is short text.';
  const longText =
    'This is a very long text that exceeds the default trim length of one hundred and fifty characters so it should be truncated and show the read more button.';

  test('renders full text without toggle when text is shorter than trimLength', () => {
    render(
      <TestWrapper>
        <ReadMore text={shortText} />
      </TestWrapper>
    );
    expect(screen.getByText(shortText)).toBeInTheDocument();
    expect(screen.queryByText(/read more/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/show less/i)).not.toBeInTheDocument();
  });

  test('renders truncated text with Read more when text exceeds trimLength', () => {
    render(
      <TestWrapper>
        <ReadMore text={longText} />
      </TestWrapper>
    );
    expect(screen.queryByText(longText)).not.toBeInTheDocument();
    expect(screen.getByText('readMore')).toBeInTheDocument();
  });

  test('expands full text and shows Show less on clicking Read more', () => {
    render(
      <TestWrapper>
        <ReadMore text={longText} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('readMore'));
    expect(screen.getByText(content => content.includes('read more button.'))).toBeInTheDocument();
    expect(screen.getByText('showLess')).toBeInTheDocument();
  });

  test('collapses back to truncated text on clicking Show less', () => {
    render(
      <TestWrapper>
        <ReadMore text={longText} />
      </TestWrapper>
    );
    fireEvent.click(screen.getByText('readMore'));
    fireEvent.click(screen.getByText('showLess'));
    expect(screen.queryByText(longText)).not.toBeInTheDocument();
    expect(screen.getByText('readMore')).toBeInTheDocument();
  });

  test('respects custom trimLength', () => {
    render(
      <TestWrapper>
        <ReadMore text={longText} trimLength={20} />
      </TestWrapper>
    );
    expect(screen.getByText('readMore')).toBeInTheDocument();
    expect(screen.queryByText(longText)).not.toBeInTheDocument();
  });
});
