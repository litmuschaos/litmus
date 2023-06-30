declare namespace DefaultLayoutModuleScssNamespace {
  export interface IDefaultLayoutModuleScss {
    container: string;
    innerContainer: string;
    innerContainerWithSubHeader: string;
    innerContainerWithoutSubHeader: string;
    leftSideBar: string;
    pageBody: string;
    pageBodyWithLevelUpBanner: string;
    rightSideBar: string;
    subHeader: string;
    test: string;
    title: string;
  }
}

declare const DefaultLayoutModuleScssModule: DefaultLayoutModuleScssNamespace.IDefaultLayoutModuleScss;

export = DefaultLayoutModuleScssModule;
