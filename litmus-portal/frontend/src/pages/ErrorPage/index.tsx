import { Typography, Button } from '@material-ui/core';
import * as React from 'react';
import useStyles from './styles';
import { history } from '../../redux/configureStore';
import Scaffold from '../../containers/layouts/Scaffold';

const ErrorPage = () => {
  const classes = useStyles();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  });
  return (
    <Scaffold>
      <div className={classes.mainHeader}>
        <div className={classes.rootContainer}>
          <div className={classes.root}>
            <div className={classes.headerDiv}>
              <Typography className={classes.mainText}>
                <strong>
                  Whoops!
                  <br />
                  This page is unavailable
                </strong>
              </Typography>
              <Typography className={classes.descText}>
                The page does not exist, or please try again later.
              </Typography>
              <Button
                onClick={() => history.push('/')}
                className={classes.backBtn}
              >
                Go back home
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
