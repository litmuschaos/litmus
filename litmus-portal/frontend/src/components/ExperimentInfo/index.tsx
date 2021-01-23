import React from 'react';
import { Typography } from '@material-ui/core';
import useStyles from './styles';
import VideoFrame from '../VideoFrame';

interface ExpInfoProps {
  description?: string;
  videoURL: string;
}
const ExperimentInfo: React.FC<ExpInfoProps> = ({ description, videoURL }) => {
  const videoEmbed = videoURL?.replace(/watch\?v=/g, 'embed/');

  const classes = useStyles();
  return (
    <div className={classes.root}>
      <Typography className={classes.expDesc}>{description}</Typography>
      {videoURL && <VideoFrame width="600px" src={videoEmbed || ''} />}
    </div>
  );
};

export default ExperimentInfo;
