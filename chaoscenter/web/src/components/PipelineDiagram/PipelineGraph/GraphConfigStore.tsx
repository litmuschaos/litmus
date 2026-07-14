import { createContext } from 'react';
import type { NodeCollapsibleProps } from '../types';
interface GraphConfig {
  graphScale: number;
  isLoading?: boolean;
  collapsibleProps?: NodeCollapsibleProps;
  selectedNodeId?: string;
  readonly?: boolean;
  loaderComponent?: React.FC;
  parentSelector?: string;
  panZoom?: boolean;
  createNodeTitle?: string;
  showEndNode?: boolean;
  graphActionsLayout?: 'horizontal' | 'vertical';
  graphLinkClassname?: string;
}
const GraphConfigStore = createContext<GraphConfig>({ graphScale: 1 });

export default GraphConfigStore;
