declare namespace ChaosProbeConfigurationModuleScssNamespace {
  export interface IChaosProbeConfigurationModuleScss {
    card: string;
    cmdDetails: string;
    httpDetails: string;
    k8SDetails: string;
    promDetails: string;
    properties: string;
    table: string;
    tablePadding: string;
  }
}

declare const ChaosProbeConfigurationModuleScssModule: ChaosProbeConfigurationModuleScssNamespace.IChaosProbeConfigurationModuleScss;

export = ChaosProbeConfigurationModuleScssModule;
