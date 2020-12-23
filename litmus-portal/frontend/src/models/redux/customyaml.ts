export interface Metadata {
  name: string;
  namespace: string;
}

export interface SecurityContext {
  runAsUser: number;
  runAsNonRoot: boolean;
}

export interface Parameter {
  name: string;
  value: string;
}

export interface Arguments {
  parameters: Parameter[];
}

export interface Container {
  image: string;
  command?: string[];
  args: string[];
}

export interface Raw {
  data: string;
}

export interface Artifact {
  name: string;
  path: string;
  raw: Raw;
}

export interface Inputs {
  artifacts: Artifact[];
}

export interface Template {
  name: string;
  steps?: Steps[][];
  container?: Container;
  inputs?: Inputs;
}

export interface Steps {
  name: string;
  template: string;
}

export interface Spec {
  entrypoint: string;
  serviceAccountName: string;
  securityContext: SecurityContext;
  arguments: Arguments;
  templates: Template[];
}

export interface CustomYAML {
  apiVersion: string;
  kind: string;
  metadata: Metadata;
  spec: Spec;
}
