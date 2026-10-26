import React from 'react';
import cx from 'classnames';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import { ExperimentRunStatus } from '@api/entities';
import DartSvg from './DartArrow';
import css from './ResiliencyScoreArrowCard.module.scss';

interface ResiliencyScoreArrowCardProps {
  score: number | undefined;
  title: string;
  phase?: ExperimentRunStatus;
  fullWidth?: boolean;
  loading?: boolean;
}

const ResiliencyScoreArrowCard = ({
  score,
  title,
  fullWidth,
  phase,
  loading
}: ResiliencyScoreArrowCardProps): JSX.Element => {
  return (
    <div
      className={cx(
        css.mainContainer,
        { [css.running]: phase === ExperimentRunStatus.RUNNING },
        { [css.undefined]: phase !== ExperimentRunStatus.RUNNING && isNaN(Number(score)) },
        { [css.green]: phase !== ExperimentRunStatus.RUNNING && score !== undefined && score > 79 },
        { [css.yellow]: phase !== ExperimentRunStatus.RUNNING && score !== undefined && score <= 79 && score > 39 },
        { [css.red]: phase !== ExperimentRunStatus.RUNNING && score !== undefined && score <= 39 && score >= 0 },
        { [css.fullWidth]: fullWidth }
      )}
      data-testid="resiliencyScoreArrowCardContainer"
    >
      <DartSvg className={css.dartArrow} />
      <div className={css.text}>
        <div className={css.resilienceScoreText} data-testid="resiliencyScoreArrowCardTitle">
          {title}
        </div>
        <div className={css.resilienceScoreValue} data-testid="resiliencyScoreArrowCardScore">
          {loading ? (
            <Icon name="steps-spinner" size={22} color={Color.GREY_600} />
          ) : score !== undefined && phase !== ExperimentRunStatus.RUNNING && score !== null ? (
            `${score}%`
          ) : (
            `--`
          )}
        </div>
      </div>
    </div>
  );
};

export default ResiliencyScoreArrowCard;
