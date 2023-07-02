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
