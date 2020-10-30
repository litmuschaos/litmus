import {
  IconButton,
  MobileStepper,
  Typography,
  withStyles,
} from '@material-ui/core';
import React from 'react';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { useTranslation } from 'react-i18next';
import VideoFrame from '../VideoFrame';
import useStyles from './styles';

const MobileSlider = withStyles({
  root: {
    padding: 0,
  },
  dot: {
    color: 'transparent',
    backgroundColor: 'transparent',
  },
})(MobileStepper);

const sliderData = [
  {
    id: 0,
    link: 'https://www.youtube.com/embed/ep6yxp_23Bk',
  },
  {
    id: 1,
    link: 'https://www.youtube.com/embed/L38gBn8eEHw',
  },
  {
    id: 2,
    link: 'https://www.youtube.com/embed/W5hmNbaYPfM',
  },
  {
    id: 3,
    link: 'https://www.youtube.com/embed/yhWgzN90SME',
  },
];

const VideoCarousel = () => {
  const [activeStep, setActiveStep] = React.useState(0);
  const maxSteps = sliderData.length;

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  const { t } = useTranslation();
  const classes = useStyles();
  return (
    <div>
      {/* Header Text */}
      <Typography variant="subtitle1" className={classes.heading}>
        {t('myhub.videoCarousel.video')}
      </Typography>
      {/* Video Frame */}
      <div className={classes.videoDiv}>
        <VideoFrame width="22.5rem" src={sliderData[activeStep].link} />
      </div>
      {/* Slider Div */}
      <MobileSlider
        steps={maxSteps}
        variant="dots"
        position="static"
        activeStep={activeStep}
        nextButton={
          <IconButton
            className={classes.sliderBtn}
            aria-label="next-button"
            onClick={handleNext}
            disabled={activeStep === maxSteps - 1}
          >
            <ArrowForwardIcon fontSize="small" />
          </IconButton>
        }
        backButton={
          <IconButton
            aria-label="next-button"
            onClick={handleBack}
            disabled={activeStep === 0}
            className={classes.sliderBtn}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        }
      />
    </div>
  );
};

export default VideoCarousel;
