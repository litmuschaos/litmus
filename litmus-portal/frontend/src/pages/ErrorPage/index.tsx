import { Button, Typography } from '@material-ui/core';
import * as React from 'react';
import { useTranslation } from 'react-i18next';
import Scaffold from '../../containers/layouts/Scaffold';
import { history } from '../../redux/configureStore';
import useStyles from './styles';

const ErrorPage = () => {
  const classes = useStyles();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  });
  const { t } = useTranslation();
  return (
    <Scaffold>
      <div className={classes.mainHeader}>
        <div className={classes.rootContainer}>
          <div className={classes.root}>
            <div className={classes.headerDiv}>
              <Typography className={classes.mainText}>
                <strong>
                  {t('error.whoops')}
                  <br />
                  {t('error.pageUnavailable')}
                </strong>
              </Typography>
              <Typography className={classes.descText}>
                {t('error.pageDoesNotExist')}
              </Typography>
              <Button
                onClick={() => history.push('/')}
                className={classes.backBtn}
              >
                {t('error.backHome')}
              </Button>
            </div>
            <div className={classes.imgDiv}>
              <img
                src="/icons/litmus-404.png"
                className={classes.errImg}
                alt="404"
              />
            </div>
          </div>
        </div>
      </div>
    </Scaffold>
  );
};

export default ErrorPage;
