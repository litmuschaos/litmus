import React from 'react';
import cx from 'classnames';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import experimentSvg from './experiment.svg';
import runSvg from './run.svg';
import css from './ExperimentAndRunCard.module.scss';

export enum ExperimentAndRunCardType {
  EXPERIMENT = 'Experiment',
  RUN = 'Run'
}
interface ExperimentAndRunCardProps {
  value: number | undefined;
  title: string;
  type: ExperimentAndRunCardType;
  fullWidth?: boolean;
  loading?: boolean;
}

const ExperimentAndRunCard = ({ value, title, type, fullWidth, loading }: ExperimentAndRunCardProps): JSX.Element => {
  return (
    <div
      className={cx(
        css.mainContainer,
        { [css.fullWidth]: fullWidth },
        { [css.experiment]: type === ExperimentAndRunCardType.EXPERIMENT },
        { [css.run]: type === ExperimentAndRunCardType.RUN },
        { [css.undefined]: value === undefined || loading }
      )}
      data-testid="experimentAndRunCardContainer"
    >
      <img
        src={type === ExperimentAndRunCardType.EXPERIMENT ? experimentSvg : runSvg}
        className={css.bgImg}
        alt={type === ExperimentAndRunCardType.EXPERIMENT ? 'experiment' : 'run'}
        data-testid="experimentAndRunCardImage"
      />
      <div className={css.text}>
        <div className={css.titleText} data-testid="experimentAndRunCardTitle">
          {title}
        </div>
        <div className={css.value} data-testid="experimentAndRunCardValue">
          {loading ? (
            <Icon name="steps-spinner" size={22} color={Color.GREY_600} />
          ) : value !== undefined ? (
            `${value}`
          ) : (
            `--`
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentAndRunCard;
