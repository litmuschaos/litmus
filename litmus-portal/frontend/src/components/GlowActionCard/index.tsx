import { Card, CardActionArea, Typography } from '@material-ui/core';
import React from 'react';
import { ReactComponent as Arrow } from '../../svg/arrow.svg';
import { ReactComponent as ArrowDisabled } from '../../svg/arrow_disabled.svg';
import useStyles from './styles';

interface CreateActionCardProps {
  isDisabled?: boolean;
  heading?: string;
  info?: string;
  handleClick?: () => void;
}

const GlowActionCard: React.FC<CreateActionCardProps> = ({
  isDisabled,
  heading,
  info,
  handleClick,
}) => {
  const classes = useStyles({ isDisabled });

  return (
    <Card
      onClick={isDisabled ? () => {} : handleClick}
      className={classes.createCardRoot}
    >
      <CardActionArea className={classes.createCardAction}>
        <Typography className={classes.createCardHeading}>{heading}</Typography>
        <Typography variant="h5" className={classes.createCardTitle}>
          {info}
        </Typography>
        {isDisabled ? (
          <ArrowDisabled className={classes.arrowForwardIcon} />
        ) : (
          <Arrow className={classes.arrowForwardIcon} />
        )}
      </CardActionArea>
    </Card>
  );
};

export { GlowActionCard };
