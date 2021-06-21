import { Typography, useTheme } from '@material-ui/core';
import { LitmusCard } from 'litmus-ui';
import React from 'react';
import useStyles from './styles';

interface CardProps extends Partial<ICards> {
  subData?: Array<SubData>;
}

interface SubData {
  option1: any;
  option2: string;
}

interface ICards {
  image: string;
  header: string;
  subtitle: string;
  color: string;
  data: any;
  split?: boolean;
}

const Card: React.FC<CardProps> = ({
  image,
  header,
  subtitle,
  color,
  data,
  split,
  subData,
}) => {
  const classes = useStyles();
  const { palette } = useTheme();
  return (
    <LitmusCard
      borderColor={palette.border.main}
      width="22.5rem"
      height="10.3rem"
      className={classes.litmusCard}
    >
      <div>
        <div className={classes.flex}>
          <img src={image} alt="Alternate" />
          <Typography variant="h6" className={classes.cardTitle}>
            {header}
          </Typography>
        </div>
        <Typography className={classes.cardDescription}>{subtitle}</Typography>
        {split ? (
          <div className={classes.flex}>
            <Typography className={`${color} ${classes.dataField}`}>
              {data}
            </Typography>
            <div style={{ marginLeft: 'auto', marginTop: 20 }}>
              {subData?.map((option) => {
                return (
                  <Typography style={{ opacity: 0.5 }}>
                    <strong>{option.option1}</strong> {option.option2}
                  </Typography>
                );
              })}
            </div>
          </div>
        ) : (
          <Typography className={`${color} ${classes.dataField}`}>
            {data}
          </Typography>
        )}
      </div>
    </LitmusCard>
  );
};

export default Card;
