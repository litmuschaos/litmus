declare namespace PipelineGraphModuleScssNamespace {
  export interface IPipelineGraphModuleScss {
    common: string;
    dash: string;
    draggableParent: string;
    graphMain: string;
    graphNode: string;
    graphTree: string;
    main: string;
    node: string;
    nodeLeftPadding: string;
    nodeRightPadding: string;
    overlay: string;
    parallel: string;
    pathExecute: string;
    svgArrow: string;
  }
}

declare const PipelineGraphModuleScssModule: PipelineGraphModuleScssNamespace.IPipelineGraphModuleScss;

export = PipelineGraphModuleScssModule;
