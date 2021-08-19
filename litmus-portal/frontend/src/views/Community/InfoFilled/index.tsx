/* eslint-disable no-unused-expressions */
import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import Loader from '../../../components/Loader';
import Center from '../../../containers/layouts/Center';
import { RootState } from '../../../redux/reducers';
import DownloadIcon from '../../../svg/downloadGreen.svg';
import WorkflowIcon from '../../../svg/workflowsPurple.svg';
import formatCount from '../../../utils/formatCount';
import useStyles from './styles';

interface CardValueData {
  imgPath: string;
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
  // Card Value Data fetched from Redux
  const { communityData, loading, error } = useSelector(
    (state: RootState) => state.communityData
  );

  const cardData: CardValueData[] = [
    {
      imgPath: './icons/myhub.svg',
      value: parseInt(communityData.github.experimentsCount, 10),
      statType: 'Total Experiments',
    },
    {
      imgPath: DownloadIcon,
      value: parseInt(communityData.google.operatorInstalls, 10),
      statType: 'Operator Installs',
      plus: true,
    },
    {
      imgPath: WorkflowIcon,
      value: parseInt(communityData.google.totalRuns, 10),
      statType: 'Total Experiment Runs',
      plus: true,
    },
    {
      imgPath: './icons/github.svg',
      value: parseInt(communityData.github.stars, 10),
      statType: 'GitHub Stars',
      plus: true,
    },
  ];

  const cardArray = cardData.map((individualCard) => {
    return (
      <div key={individualCard.statType} className={classes.infoFilledDiv}>
        {/*
          If value of plus is provided then render a different
          plus icon else dont
          
          formatCount -> utility is used to convert large value to
          their respective Thousands or Millions respectively
        */}
        <div
          role="button"
          tabIndex={0}
          className={classes.imgTextWrap}
          onClick={() => {
            individualCard.statType === 'GitHub Stars'
              ? window.open('https://github.com/litmuschaos/litmus')
              : window.open('https://hub.litmuschaos.io');
          }}
          onKeyDown={() => {
            individualCard.statType === 'GitHub Stars'
              ? window.open('https://github.com/litmuschaos/litmus')
              : window.open('https://hub.litmuschaos.io');
          }}
        >
          <img src={individualCard.imgPath} alt={individualCard.statType} />
          <Typography className={classes.value}>
            {formatCount(individualCard.value)}
            {individualCard.plus && <span className={classes.plusBtn}>+</span>}
          </Typography>
        </div>

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
