import { CreateNodeOptions, Document, DocumentOptions, ParseOptions, SchemaOptions } from 'yaml';

// https://github.com/eemeli/yaml/issues/211
export function yamlStringify(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  options: DocumentOptions & SchemaOptions & ParseOptions & CreateNodeOptions = {}
): string {
  const doc = new Document(obj, { version: '1.1', aliasDuplicateObjects: false, ...options });
  return String(doc);
}
