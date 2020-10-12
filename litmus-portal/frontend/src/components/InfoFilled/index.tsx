import { useTheme } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Center from '../../containers/layouts/Center';
import { RootState } from '../../redux/reducers';
import formatCount from '../../utils/formatCount';
import Loader from '../Loader';
import useStyles from './styles';

interface CardValueData {
  color: string;
  value: number;
  statType: string;
  plus?: boolean | undefined;
}
/*
  Reusable Custom Information Card
  Required Params: color, statType
  Optional Params: plus, value
*/

const InfoFilledWrap: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();
  const theme = useTheme();
  // Card Value Data fetched from Redux
  const { communityData, loading, error } = useSelector(
    (state: RootState) => state.communityData
  );

  const cardData: CardValueData[] = [
    {
      color: theme.palette.warning.main,
      value: parseInt(communityData.github.experimentsCount, 10),
      statType: 'Total Experiments',
    },
    {
      color: theme.palette.primary.dark,
      value: parseInt(communityData.google.operatorInstalls, 10),
      statType: 'Operator Installed',
      plus: true,
    },
    {
      color: theme.palette.totalRunsCountColor,
      value: parseInt(communityData.google.totalRuns, 10),
      statType: 'Total Experiment Runs',
      plus: true,
    },
    {
      color: theme.palette.error.main,
      value: parseInt(communityData.github.stars, 10),
      statType: 'Github Stars',
    },
  ];

  const cardArray = cardData.map((individualCard) => {
    return (
      <div
        key={individualCard.value}
        style={{ backgroundColor: `${individualCard.color}` }}
        className={classes.infoFilledDiv}
      >
        {/*
          If value of plus is provided then render a different
          plus icon else dont
          
          formatCount -> utility is used to convert large value to
          their respective Thousands or Millions respectively
        */}
        {individualCard.plus ? (
          <Typography className={classes.value}>
            {formatCount(individualCard.value)}
            <span className={classes.plusBtn}>+</span>
          </Typography>
        ) : (
          <Typography className={classes.value}>
            {formatCount(individualCard.value)}
          </Typography>
        )}
        <hr className={classes.horizontalRule} />
        <Typography className={classes.statType}>
          {individualCard.statType}
        </Typography>
      </div>
    );
  });

  return (
    <div className={classes.infoFilledWrap}>
      {loading ? (
        <div>
          <Loader />
          <Typography>{t('internetIssues.fetchData')}</Typography>
        </div>
      ) : error ? (
        <div className={classes.errorMessage}>
          <Center>
            <Typography variant="h4">
              {t('internetIssues.connectionError')}
            </Typography>
          </Center>
        </div>
      ) : (
        cardArray
      )}
    </div>
  );
};

export default InfoFilledWrap;
