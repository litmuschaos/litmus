import { Typography } from '@material-ui/core';
import React from 'react';
import useStyles from './styles';

interface InfoFilledProps {
  color: string;
  value: string;
  statType: string;
}
const InfoFilled: React.FC<InfoFilledProps> = ({ color, value, statType }) => {
  const classes = useStyles();
  return (
    <div
      style={{
        backgroundColor: `${color}`,
        width: 170,
        height: 195,
        marginBottom: 40,
        marginRight: 40,
        borderRadius: 3,
      }}
    >
      <Typography className={classes.value}>{value}</Typography>
      <hr style={{ width: 120, opacity: 0.5 }} />
      <Typography className={classes.statType}>{statType}</Typography>
    </div>
  );
};

export default InfoFilled;
