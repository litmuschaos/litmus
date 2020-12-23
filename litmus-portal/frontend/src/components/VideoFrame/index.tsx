import React from 'react';
import useStyles from './styles';

interface IVideoBox {
  width: string;
}
interface IVideoFrame extends IVideoBox {
  src: string;
}

const VideoFrame: React.FC<IVideoFrame> = ({ width, src }) => {
  const classes = useStyles();
  return (
    <div className={classes.videoDiv}>
      <iframe
        title="chaos-video"
        src={src}
        frameBorder="0"
        allow="accelerometer"
        allowFullScreen
        className={classes.videoBox}
        style={{ width, height: `calc(${width} / (16 / 9))` }}
      />
    </div>
  );
};
export default VideoFrame;
