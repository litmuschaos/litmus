import React from 'react';
import { GraphPanelProps } from '../../../models/dashboardsData';
import PanelContent from './PanelContent';

const GraphPanel: React.FC<GraphPanelProps> = ({ ...props }) => {
  return <PanelContent {...props} />;
};

export default GraphPanel;
