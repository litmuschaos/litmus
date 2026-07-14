import React from 'react';
import { Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import cx from 'classnames';
import { useStrings } from '@strings';
import css from './InputSlider.module.scss';

export interface InputSliderProps {
  name: string;
  initialValue?: number;
  onChange: (weight: number) => void;
}

export default function InputSlider({ initialValue, name, onChange }: InputSliderProps): React.ReactElement {
  const { getString } = useStrings();
  const [value, setValue] = React.useState(initialValue);

  return (
    <Layout.Horizontal className={css.gap3} flex={{ alignItems: 'center' }}>
      <Text
        font={{ variation: FontVariation.H6, weight: 'bold' }}
        color={Color.PRIMARY_7}
        width={85}
        style={{ textAlign: 'end' }}
        margin={{ right: 'large' }}
      >
        {value} {getString('points')}
      </Text>
      <Layout.Vertical className={cx(css.grow, css.gap1)}>
        <div className={css.rangeSliderCont}>
          <input
            data-testid={getString('rangeSliderInput')}
            type={getString('range')}
            name={name}
            value={value}
            min={0}
            max={10}
            step={1}
            onChange={e => {
              setValue(parseInt(e.target.value));
              onChange(parseInt(e.target.value));
            }}
            className={cx(css[`inputScore${value}` as keyof typeof css])}
          />
          <div className={css.zeroLabel}>0</div>
          <div className={css.tenLabel}>10</div>
          <div className={css.rangeLabel}>
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      </Layout.Vertical>
    </Layout.Horizontal>
  );
}
