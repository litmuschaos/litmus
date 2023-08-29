import React from 'react';
import type { InputSliderProps } from '../InputSlider';

export default function MockedInputSlider({ initialValue, name, onChange }: InputSliderProps): React.ReactElement {
  return (
    <div onChange={() => onChange(1)}>
      {initialValue},{name}
    </div>
  );
}
