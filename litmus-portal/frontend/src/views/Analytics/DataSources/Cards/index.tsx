import React from 'react';
import CardContainer from './CardContainer';
import CardContent from './CardContent';
import { DataSourceData } from '../../../../models/dataSourceData';

const DataSourceCard: React.FC<DataSourceData> = ({ ...props }) => {
  return (
    <CardContainer>
      <CardContent {...props} />
    </CardContainer>
  );
};

export default DataSourceCard;
