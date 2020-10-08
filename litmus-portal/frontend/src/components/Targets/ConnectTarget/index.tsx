import { Typography } from '@material-ui/core';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { history } from '../../../redux/configureStore';
import ButtonFilled from '../../Button/ButtonFilled';
import ButtonOutline from '../../Button/ButtonOutline';
import TargetCopy from '../TargetCopy';
import useStyles from './styles';
import Scaffold from '../../../containers/layouts/Scaffold';
import Unimodal from '../../../containers/layouts/Unimodal';

const engineUrl: string = 'kubectl apply -f';
const CenteredTabs = () => {
  const classes = useStyles();
  const [open, setOpen] = React.useState(false);
  const handleClose = () => {
    history.push('/workflows');
    setOpen(false);
  };
  const handleClickModal = () => {
    setOpen(true);
  };
  const handleClick = () => {
    history.push('/targets');
  };
  const { t } = useTranslation();

  return (
    <Scaffold>
      <section className="Header section">
        <div className={classes.backButton}>
          <ButtonOutline
            isDisabled={false}
            handleClick={handleClick}
            data-cy="backSelect"
          >
            <Typography>Back</Typography>
          </ButtonOutline>
          <div className={classes.header}>
            <Typography variant="h4">
              {t('Targets.connectHome.connectText')}
            </Typography>
          </div>
        </div>
      </section>
      <section className="Connect new target">
        <div className={classes.mainDiv}>
          <div className={classes.connectTarget}>
            <div className={classes.stepsDiv}>
              <Typography className={classes.connectdevice}>
                {t('Targets.newTarget.head')}
              </Typography>
              <Typography>{t('Targets.newTarget.head1')}</Typography>
              <Typography>{t('Targets.newTarget.head2')}</Typography>
              <Typography>{t('Targets.newTarget.head3')}</Typography>
              <Typography>
                {t('Targets.newTarget.head4')}{' '}
                <strong>{t('Targets.newTarget.head5')}</strong>
              </Typography>
            </div>
            <div className={classes.rightMargin}>
              <img src="icons/targetsC.svg" alt="down arrow icon" />
            </div>
          </div>
          <div className={classes.rightMargin}>
            {engineUrl && <TargetCopy yamlLink={engineUrl} />}
          </div>
          <div className={classes.button}>
            <ButtonFilled
              data-cy="connectTarget"
              isPrimary
              handleClick={handleClickModal}
            >
              <div> {t('Targets.connectHome.connectText')} </div>
            </ButtonFilled>
          </div>
        </div>
      </section>
      <div>
        <Unimodal
          isOpen={open}
          handleClose={handleClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          hasCloseBtn
        >
          <div className={classes.body}>
            <img src="icons/finish.svg" className={classes.mark} alt="mark" />
            <Typography className={classes.heading}>
              {t('ConnectTargets.title')}
              <br />
              {t('ConnectTargets.head')}
            </Typography>
            <Typography className={classes.headWorkflow}>
              {t('ConnectTargets.info')} <br />
              {t('ConnectTargets.mainLine')}
            </Typography>
            <div className={classes.buttonModal}>
              <ButtonOutline
                isDisabled={false}
                handleClick={() => {
                  history.push('/targets');
                  setOpen(false);
                }}
              >
                <div>{t('ConnectTargets.button.buttonBack')}</div>
              </ButtonOutline>

              <ButtonFilled
                data-cy="connectTarget"
                isPrimary={false}
                handleClick={() => {
                  history.push('/create-workflow');
                  setOpen(false);
                }}
              >
                <div> {t('ConnectTargets.button.buttonSchedule')}</div>
              </ButtonFilled>
            </div>
          </div>
        </Unimodal>
      </div>
    </Scaffold>
  );
};
export default CenteredTabs;
