import React from 'react';
import { DashboardData } from '../../../../../../models/dashboardsData';
import CardContainer from './CardContainer';
import CardContent from './CardContent';

const DataSourceCard: React.FC<DashboardData> = ({ ...props }) => {
  return (
    <CardContainer>
      <CardContent {...props} />
    </CardContainer>
  );
};

export default DataSourceCard;
