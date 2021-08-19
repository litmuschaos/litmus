import Typography from '@material-ui/core/Typography';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { constants } from '../../../constants';
import SlackLogo from '../../../svg/slack.svg';
import useStyles from './style';

const CommunityCards: React.FC = () => {
  const classes = useStyles();
  const { t } = useTranslation();

  return (
    <div className={classes.root}>
      <div
        role="button"
        tabIndex={0}
        className={`${classes.feedback} ${classes.joinCard}`}
        onClick={() => window.open(constants.FeedbackForm)}
        onKeyDown={() => window.open(constants.FeedbackForm)}
      >
        <div className={classes.textImageWrapper}>
          <img
            className={classes.secondaryIcons}
            src="./icons/feedback.svg"
            alt="right-arrow"
          />
          <div>
            <Typography
              className={`${classes.joinCardText} ${classes.joinCardTextMedium}`}
            >
              {t('community.feedback.title')}
            </Typography>
            <Typography
              className={`${classes.joinCardText} ${classes.joinCardTextSmall}`}
            >
              {t('community.feedback.subHeading')}
            </Typography>
          </div>
        </div>
        <img
          className={classes.arrowIcon}
          src="./icons/right-arrow.svg"
          alt="right-arrow"
        />
      </div>
      <div
        role="button"
        tabIndex={0}
        className={`${classes.slack} ${classes.joinCard}`}
        onClick={() =>
          window.open('https://kubernetes.slack.com/archives/CNXNB0ZTN')
        }
        onKeyDown={() =>
          window.open('https://kubernetes.slack.com/archives/CNXNB0ZTN')
        }
      >
        <div className={classes.cardTextWithLogo}>
          <Typography
            className={`${classes.joinCardText} ${classes.joinCardTextLarge}`}
          >
            {t('community.joinSlack')}
          </Typography>
          <img src={SlackLogo} alt="Slack logo" className={classes.logo} />
        </div>
        <img
          className={classes.arrowIcon}
          src="./icons/right-arrow.svg"
          alt="right-arrow"
        />
      </div>
      <div
        role="button"
        tabIndex={0}
        className={`${classes.communityEvents} ${classes.joinCard}`}
        onClick={() => window.open('https://litmuschaos.io/community')}
        onKeyDown={() => window.open('https://litmuschaos.io/community')}
      >
        <div className={classes.textImageWrapper}>
          <img
            className={classes.secondaryIcons}
            src="./icons/communityMeetup.svg"
            alt="right-arrow"
          />
          <div>
            <Typography
              className={`${classes.joinCardText} ${classes.joinCardTextMedium}`}
            >
              {t('community.communityEvents.title')}
            </Typography>
            <Typography
              className={`${classes.joinCardText} ${classes.joinCardTextSmall}`}
            >
              {t('community.communityEvents.subHeading')}
            </Typography>
          </div>
        </div>
        <img
          className={classes.arrowIcon}
          src="./icons/right-arrow.svg"
          alt="right-arrow"
        />
      </div>
    </div>
  );
};

export default CommunityCards;
