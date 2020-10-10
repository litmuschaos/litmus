import React from 'react';
import Typography from '@material-ui/core/Typography';
import { Tooltip } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import useStyles from './style';
import ColouredProgressBar from '../../../../components/ProgressBar/ColouredProgressBar';

interface ScoreProps {
  score: number;
  high: boolean;
  color: string;
  name: string;
}

const Score: React.FC<ScoreProps> = ({ score, high, color, name }) => {
  const classes = useStyles();
  const { t } = useTranslation();
  const info = `Average: ${score}`;
  return (
    <Tooltip title={info}>
      <div className={classes.mainDiv}>
        <div className={classes.mainDivRow}>
          <Typography variant="subtitle2" className={classes.typographyScores}>
            {high ? t('analytics.highestScore') : t('analytics.lowestScore')}
          </Typography>
          <Typography
            variant="caption"
            display="inline"
            className={classes.typographyScores}
            style={{ color }}
            gutterBottom
          >
            {name}
          </Typography>
        </div>
        <ColouredProgressBar value={score} color={color} width={3} />
      </div>
    </Tooltip>
  );
};

export default Score;
