declare namespace LoaderModuleScssNamespace {
  export interface ILoaderModuleScss {
    content: string;
    fixed: string;
    noDataCard: string;
    noDataCardContainer: string;
    spinner: string;
  }
}

declare const LoaderModuleScssModule: LoaderModuleScssNamespace.ILoaderModuleScss;

export = LoaderModuleScssModule;
