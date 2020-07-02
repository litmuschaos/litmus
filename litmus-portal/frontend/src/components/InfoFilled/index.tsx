import React from 'react';
import Typography from '@material-ui/core/Typography';
import useStyles from './styles';
import formatCount from '../../utils/formatCount';

interface CustomInfoProps {
  color: string;
  value: number;
  statType: string;
  plus?: boolean | undefined;
}

/*  
  Reusable Custom Information Card
  Required Params: color, value, statType
  Optional Params: plus
*/
const InfoFilled: React.FC<CustomInfoProps> = ({
  color,
  value,
  statType,
  plus,
}) => {
  const classes = useStyles();
  return (
    <div
      style={{ backgroundColor: `${color}` }}
      className={classes.infoFilledDiv}
    >
      {/* 
        If value of plus is provided then render a different 
        plus icon else dont
        
        formatCount -> utility is used to convert large value to
        their respective Thousands or Millions respectively
      */}
      {plus ? (
        <Typography className={classes.value}>
          {formatCount(value)}
          <span className={classes.plusBtn}>+</span>
        </Typography>
      ) : (
        <Typography className={classes.value}>{formatCount(value)}</Typography>
      )}
      <hr className={classes.horizontalRule} />
      <Typography className={classes.statType}>{statType}</Typography>
    </div>
  );
};

export default InfoFilled;
