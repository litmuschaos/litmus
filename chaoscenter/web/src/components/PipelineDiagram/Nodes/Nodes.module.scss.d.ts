declare namespace NodesModuleScssNamespace {
  export interface INodesModuleScss {
    defaultNode: string;
    icon: string;
    marker: string;
    markerEndNode: string;
    markerStartNode: string;
    nodeStart: string;
    stageNode: string;
    stepNode: string;
  }
}

declare const NodesModuleScssModule: NodesModuleScssNamespace.INodesModuleScss;

export = NodesModuleScssModule;
