import { Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface InfoFilledProps {
  color: string;
  value: string;
  statType: string;
}
const InfoFilled: React.FC<InfoFilledProps> = ({ color, value, statType }) => {
  const classes = useStyles({ color });
  return (
    <div className={classes.mainDiv}>
      <Typography className={classes.value}>{value}</Typography>
      <hr className={classes.horizontalLine} />
      <Typography className={classes.statType}>{statType}</Typography>
    </div>
  );
};

export default InfoFilled;
