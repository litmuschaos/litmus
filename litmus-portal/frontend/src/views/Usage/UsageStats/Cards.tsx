import { Typography } from '@material-ui/core';
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
  return (
    <LitmusCard
      borderColor="#B3B7CC"
      width="360px"
      height="165px"
      className={classes.litmusCard}
    >
      <div>
        <div className={classes.cardHeader}>
          <img src={image} alt="users" />
          <Typography variant="h6" className={classes.cardTitle}>
            {header}
          </Typography>
        </div>
        <Typography className={classes.cardDescription}>{subtitle}</Typography>
        {split ? (
          <div style={{ display: 'flex' }}>
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
