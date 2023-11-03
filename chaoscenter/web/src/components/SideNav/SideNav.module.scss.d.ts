declare namespace SideNavModuleScssNamespace {
  export interface ISideNavModuleScss {
    bottomContainer: string;
    collapse: string;
    expand: string;
    icon: string;
    iconContainer: string;
    link: string;
    logOutContainer: string;
    main: string;
    newNav: string;
    popover: string;
    popoverTarget: string;
    selectButton: string;
    selected: string;
    sideNavExpanded: string;
    sideNavResizeBtn: string;
    subTitle: string;
    text: string;
    title: string;
    titleContainer: string;
    triangle: string;
  }
}

declare const SideNavModuleScssModule: SideNavModuleScssNamespace.ISideNavModuleScss;

export = SideNavModuleScssModule;
