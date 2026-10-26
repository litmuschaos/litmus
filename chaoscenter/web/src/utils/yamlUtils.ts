import { CreateNodeOptions, Document, DocumentOptions, ParseOptions, SchemaOptions } from 'yaml';
import type { CronWorkflow } from '@models';

// https://github.com/eemeli/yaml/issues/211
export function yamlStringify(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  obj: any,
  options: DocumentOptions & SchemaOptions & ParseOptions & CreateNodeOptions = {}
): string {
  const doc = new Document(obj, { version: '1.1', aliasDuplicateObjects: false, ...options });
  return String(doc);
}

/**
 * @description Downloads YAML response as a file
 *
 * @param yamlResponse YAML file/response received
 * @param fileName Name of the file to be downlaoded
 * @returns Promise resolving to an object with status as boolean
 */
export const downloadYamlAsFile = async (yamlResponse: any, fileName: string): Promise<{ status: boolean }> => {
  try {
    const response = new Response(yamlResponse);
    const blob = await (response as any).blob();
    const file = new Blob([blob]);
    const data = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.style.display = 'none';
    anchor.href = data;
    anchor.download = fileName;
    anchor.click();
    // For Firefox
    setTimeout(() => {
      anchor.remove();
      // Release resource on disk after triggering the download
      window.URL.revokeObjectURL(data);
    }, 100);
    return { status: true };
  } catch (e) {
    return { status: false };
  }
};

export function cronEnabled(workflowManifest: CronWorkflow) {
  if ((workflowManifest as CronWorkflow)?.spec?.suspend === undefined) {
    return true;
  } else if (workflowManifest && (workflowManifest as CronWorkflow)?.spec?.suspend !== undefined) {
    return !(workflowManifest as CronWorkflow)?.spec?.suspend;
  }
}
