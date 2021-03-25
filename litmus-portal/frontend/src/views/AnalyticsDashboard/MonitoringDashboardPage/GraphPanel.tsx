import React from 'react';
import { GraphPanelProps } from './base';
import PanelContent from './PanelContent';

const GraphPanel: React.FC<GraphPanelProps> = ({ ...props }) => {
  return <PanelContent {...props} />;
};

export default GraphPanel;
