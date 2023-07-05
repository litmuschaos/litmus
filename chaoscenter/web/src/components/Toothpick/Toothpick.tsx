import React from 'react';
import { SelectOption, Select, Text, Container } from '@harnessio/uicore';
import css from './Toothpick.module.scss';

interface ToothpickPropsInterface {
  label?: string;
  startValue: SelectOption;
  startOptions: SelectOption[];
  handleStartValueChange: (option: SelectOption) => void;
  endValue: SelectOption;
  endOptions: SelectOption[];
  handleEndValueChange: (option: SelectOption) => void;
  adjoiningText: string;
  endingText?: string;
  defaultFirstOptions?: boolean;
  className?: string;
}

const getSelectValueOption = (val: string | SelectOption, options: SelectOption[]): any => {
  if (Array.isArray(val)) {
    return val;
  } else if (options && val) {
    return options.find((option: SelectOption) => option.value === val);
  }
  return undefined;
};
// Component that allows you to pick from both sides
const Toothpick: React.FC<ToothpickPropsInterface> = props => {
  const {
    label,
    startValue,
    startOptions,
    handleStartValueChange,
    endValue,
    endOptions,
    handleEndValueChange,
    adjoiningText,
    endingText,
    className
  } = props;

  return (
    <Container data-name="toothpick" className={className ? className : ''}>
      {label && <Text className={css.label}>{label}</Text>}
      <Container className={css.toothpick}>
        <Select
          className={css.selectStyle}
          value={getSelectValueOption(startValue, startOptions)}
          items={startOptions}
          onChange={handleStartValueChange}
        />
        <Text className={css.adjoiningText}>{adjoiningText}</Text>
        <Select
          className={css.selectStyle}
          value={getSelectValueOption(endValue, endOptions)}
          items={endOptions}
          onChange={handleEndValueChange}
        />
        {endingText && <Text className={css.adjoiningText}>{endingText}</Text>}
      </Container>
    </Container>
  );
};
export default Toothpick;
