import { Typography, IconButton } from '@material-ui/core';
import * as React from 'react';
import CloseIcon from '@material-ui/icons/Close';
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
  const docs = 'https://docs.litmuschaos.io/docs/getstarted/';

  const classes = useStyles();
  return (
    <>
      {display ? (
        <div className={classes.root}>
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <div className={classes.mainDiv}>
              <Typography className={classes.mainText}>{header}</Typography>
              <Typography className={classes.textDesc}>
                {description}
              </Typography>
              {expAvailable ? (
                <div className={classes.imgDiv}>
                  <img src="/icons/guide.png" alt="dev_guide" />
                  <a href={docs} className={classes.guideLink} target="_">
                    Developer&#39;s guide
                  </a>
                </div>
              ) : (
                <></>
              )}
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <IconButton
                aria-label="upload picture"
                component="span"
                onClick={handleClose}
                className={classes.closeIcon}
              >
                <CloseIcon />
              </IconButton>
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
