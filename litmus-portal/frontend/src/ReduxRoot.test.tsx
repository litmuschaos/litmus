import React from 'react';
import { render } from '@testing-library/react';
import ReduxRoot from './ReduxRoot';
import '@testing-library/jest-dom';

describe('<ReduxRoot />', () => {
  it('renders', async () => {
    const { findByTestId } = render(<ReduxRoot />);
    expect(findByTestId('app')).toBeTruthy();
  });
});
