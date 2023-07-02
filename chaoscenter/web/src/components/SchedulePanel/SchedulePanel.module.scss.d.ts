declare namespace SchedulePanelModuleScssNamespace {
  export interface ISchedulePanelModuleScss {
    date: string;
    formContent: string;
    formContentTitle: string;
    heading: string;
    recurrence: string;
    repeatEveryNumber: string;
    repeatEveryOption: string;
    repeatOnContainer: string;
    schedulePanelContainer: string;
    timePopover: string;
    timezone: string;
  }
}

declare const SchedulePanelModuleScssModule: SchedulePanelModuleScssNamespace.ISchedulePanelModuleScss;

export = SchedulePanelModuleScssModule;
