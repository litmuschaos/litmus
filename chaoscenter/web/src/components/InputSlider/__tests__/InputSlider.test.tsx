import '@testing-library/jest-dom/extend-expect';
import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { TestWrapper } from 'utils/testUtils';
import InputSlider from '..';
import MockedInputSlider from '../__mocks__/MockedInputSlider';

// eslint-disable-next-line react/display-name
jest.mock('../__mocks__/MockedInputSlider.tsx', () => (props: any) => <div data-testid="input-slider" {...props} />);

describe('Input Slider Test', () => {
  test('should render with correct props', () => {
    const { getByTestId } = render(<MockedInputSlider name="Weight Slider" initialValue={0} onChange={() => void 0} />);

    expect(getByTestId('input-slider')).toHaveAttribute('name', 'Weight Slider');
    expect(getByTestId('input-slider')).toHaveAttribute('initialValue', '0');
  });

  test('should have correct weights', async () => {
    const { getByTestId } = render(
      <TestWrapper>
        <InputSlider name="Weight Slider" initialValue={7} onChange={() => void 0} />
      </TestWrapper>
    );

    expect(getByTestId('rangeSliderInput')).toHaveClass('inputScore7');
  });

  test('should update weights', async () => {
    const onChangeMock = jest.fn();
    const event = {
      preventDefault() {
        void 0;
      },
      target: { value: 8 }
    };
    const { getByTestId } = render(
      <TestWrapper>
        <InputSlider name="Weight Slider" initialValue={2} onChange={onChangeMock} />
      </TestWrapper>
    );

    fireEvent.change(getByTestId('rangeSliderInput'), event);

    expect(getByTestId('rangeSliderInput')).toHaveClass('inputScore8');
  });
});
