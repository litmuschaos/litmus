import React from 'react';
import { GraphPanelGroupProps } from '../../../../models/dashboardsData';
import PanelGroupContent from './PanelGroupContent';

const DashboardPanelGroup: React.FC<GraphPanelGroupProps> = ({ ...props }) => {
  return <PanelGroupContent {...props} />;
};

export default DashboardPanelGroup;
