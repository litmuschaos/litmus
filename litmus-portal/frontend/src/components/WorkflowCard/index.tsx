import React from 'react';
import CardContainer from './CardContainer';
import CardContent from './CardContent';
import { preDefinedWorkflowData } from '../../models/predefinedWorkflow';

const CustomCard: React.FC<preDefinedWorkflowData> = ({ ...props }) => {
  return (
    <CardContainer>
      <CardContent {...props} />
    </CardContainer>
  );
};

export default CustomCard;
