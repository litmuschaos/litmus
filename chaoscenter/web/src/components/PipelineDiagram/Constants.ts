export const Event: { [key: string]: string } = {
  AddLinkClicked: 'addLinkClicked',
  SelectionChanged: 'selectionChanged',
  ClickNode: 'clickNode',
  ColorChanged: 'colorChanged',
  CanvasClick: 'CanvasClick',
  WidthChanged: 'widthChanged',
  RemoveNode: 'removeNode',
  NodesUpdated: 'nodesUpdated',
  LinksUpdated: 'linksUpdated',
  OffsetUpdated: 'offsetUpdated',
  ZoomUpdated: 'zoomUpdated',
  GridUpdated: 'gridUpdated',
  StepGroupCollapsed: 'stepGroupCollapsed',
  StepGroupClicked: 'stepGroupClicked',
  EntityRemoved: 'entityRemoved',
  RollbackClicked: 'rollbackClicked',
  AddParallelNode: 'addParallelNode',
  SourcePortChanged: 'sourcePortChanged',
  TargetPortChanged: 'targetPortChanged',
  DragStart: 'dragStart',
  DropLinkEvent: 'dropLinkEvent',
  DropNodeEvent: 'dropNodeEvent',
  MouseEnterNode: 'mouseEnterNode',
  MouseOverNode: 'mouseOverNode',
  MouseLeaveNode: 'mouseLeaveNode',
  MouseEnterStepGroupTitle: 'mouseEnterStepGroupTitle',
  MouseLeaveStepGroupTitle: 'mouseLeaveStepGroupTitle'
};

export const DiagramType: { [key: string]: string } = {
  Default: 'default',
  EmptyNode: 'empty-node',
  CreateNew: 'create-new',
  DiamondNode: 'default-diamond',
  StartNode: 'node-start',
  GroupNode: 'group-node',
  StepGroupNode: 'step-group-node',
  IconNode: 'icon-node',
  Link: 'link'
};

export enum StepsType {
  Normal = 'Normal',
  Rollback = 'Rollback'
}

export const PortName: { [key: string]: string } = {
  In: 'In',
  Out: 'Out'
};

export const DiagramDrag: { [key: string]: string } = {
  NodeDrag: 'diagram-node-drag',
  AllowDropOnLink: 'allow-drop-on-link',
  AllowDropOnNode: 'allow-drop-on-node'
};

export const STATIC_SERVICE_GROUP_NAME = 'static_service_group';
