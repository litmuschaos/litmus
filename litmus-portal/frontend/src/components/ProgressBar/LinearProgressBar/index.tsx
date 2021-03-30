import React from 'react';
import LinearProgress from '@material-ui/core/LinearProgress';
import useStyle from './styles';

interface LinearProgressBarProps {
  value: number | number[];
  isDefault?: boolean;
  width: number;
}

const LinearProgressBar: React.FC<LinearProgressBarProps> = ({
  value,
  isDefault,
  width,
}) => {
  const resultValue = (value as number) * 10;

  const classes = useStyle();

  return (
    <LinearProgress
      variant="determinate"
      value={resultValue}
      classes={
        isDefault
          ? resultValue > 60
            ? {
                root: classes.root,
                barColorPrimary: classes.greenColorPrimary,
              }
            : resultValue > 30
            ? {
                root: classes.root,
                barColorPrimary: classes.yellowColorPrimary,
              }
            : {
                root: classes.root,
                barColorPrimary: classes.redColorPrimary,
              }
          : {}
      }
      style={{ height: `${width}rem`, borderRadius: '5rem' }}
    />
  );
};

export default LinearProgressBar;
