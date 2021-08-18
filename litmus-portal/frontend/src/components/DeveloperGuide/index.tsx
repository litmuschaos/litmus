import { Typography, useTheme } from '@material-ui/core';
import { Icon } from 'litmus-ui';
import * as React from 'react';
import useStyles from './styles';

interface DeveloperGuideProps {
  expAvailable: boolean;
  header: string;
  description: string;
}

const DeveloperGuide: React.FC<DeveloperGuideProps> = ({
  expAvailable,
  header,
  description,
}) => {
  const [display, setDisplay] = React.useState(true);

  const handleClose = () => {
    setDisplay(false);
  };
  const docs = 'https://docs.litmuschaos.io/';

  const classes = useStyles();
  const theme = useTheme();
  return (
    <>
      {display ? (
        <div className={classes.root}>
          <div className={classes.rootContainer}>
            <div className={classes.mainDiv}>
              <Typography className={classes.mainText}>{header}</Typography>
              <Typography className={classes.textDesc}>
                {description}
              </Typography>
              {expAvailable ? (
                <div>
                  <Icon
                    name="document"
                    size="lg"
                    color={theme.palette.primary.main}
                  />
                  <a href={docs} className={classes.guideLink} target="_">
                    Developer&#39;s guide
                  </a>
                </div>
              ) : (
                <></>
              )}
            </div>
            <div
              onClick={handleClose}
              role="button"
              onKeyDown={handleClose}
              className={classes.iconDiv}
              tabIndex={0}
            >
              <Icon name="close" size="lg" color={theme.palette.common.black} />
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
};
export default DeveloperGuide;
