import type * as monaco from 'monaco-editor';

export interface YAMLBuilderProps {
  height?: React.CSSProperties['height'];
  width?: React.CSSProperties['width'];
  fileName: string;
  existingJSON?: Record<string, any>;
  existingYaml?: string;
  isReadOnlyMode?: boolean;
  isEditModeSupported?: boolean;
  schema?: Record<string, string | any>;
  theme?: 'LIGHT' | 'DARK';
  onChange?: (isEditorDirty: boolean, updatedYaml: string) => void;
  showCopyIcon?: boolean;
  hideErrorMesageOnReadOnlyMode?: boolean;
  onErrorCallback?: (error: Record<string, any>) => void;
  comparableYaml?: string;
  yamlSanityConfig?: YamlSanityConfig;
  displayBorder?: boolean;
  renderCustomHeader?: () => React.ReactElement | null;
  customCss?: React.HTMLAttributes<HTMLDivElement>['className'];
}
export type CompletionItemInterface = Optional<monaco.languages.CompletionItem, 'range'>;

export interface YamlSanityConfig {
  removeEmptyString?: boolean;
  removeEmptyArray?: boolean;
  removeEmptyObject?: boolean;
}
