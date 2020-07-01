import React from 'react';
import Typography from '@material-ui/core/Typography';
import useStyles from './styles';

interface ParseValueProps {
  value: number;
  plus: boolean;
}

interface CustomInfoProps {
  color: string;
  value: number;
  statType: string;
  plus?: boolean | undefined;
}

/*  
  Parse The Value provided to the Custon Information Card Component
  If value is greater than equal to 1000 then the value is parsed to 1K
  and above

  If value is less than 1000 then the value is parsed to the number itself
  without the character 'k'

  Required Params: value, plus  
*/
const ParseValue: React.FC<ParseValueProps> = ({ value, plus }) => {
  const classes = useStyles();
  let getValue = 0;

  if (value >= 1000) {
    getValue = value / 1000;
    if (plus)
      return (
        <Typography className={classes.value}>
          {getValue}k<span className={classes.plusBtn}>+</span>
        </Typography>
      );
    return <Typography className={classes.value}>{getValue}k</Typography>;
  }
  getValue = value;
  if (plus)
    return (
      <Typography className={classes.value}>
        {getValue}
        <span className={classes.plusBtn}>+</span>
      </Typography>
    );
  return <Typography className={classes.value}>{getValue}</Typography>;
};

/*  
  Reusable Custom Information Card
  Required Params: color, value, statType
  Optional Params: plus
*/
const CustomInfoFilled: React.FC<CustomInfoProps> = ({
  color,
  value,
  statType,
  plus,
}) => {
  const classes = useStyles();
  return (
    <div
      style={{
        backgroundColor: `${color}`,
        width: '20em',
        height: '16em',
        marginLeft: 0,
        marginRight: '1.5em',
        borderRadius: 3,
      }}
    >
      {/* 
        If value of plus is provided then render a different 
        plus icon else dont 
      */}
      {plus ? (
        <ParseValue value={value} plus />
      ) : (
        <ParseValue value={value} plus={false} />
      )}
      <hr style={{ width: '10em', opacity: 0.5 }} />
      <Typography className={classes.statType}>{statType}</Typography>
    </div>
  );
};

export default CustomInfoFilled;
