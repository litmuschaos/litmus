import React from 'react';
import CardContainer from './CardContainer';
import CardContent from './CardContent';
import { CardProps } from './model';

const CustomCard: React.FC<CardProps> = (CardProps) => {
  return (
    <CardContainer>
      <CardContent {...CardProps} />
    </CardContainer>
  );
};

export default CustomCard;
