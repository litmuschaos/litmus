import { IAnnotation, IMarker } from 'react-ace';
import { safeLoadAll } from 'js-yaml';

export interface AceValidations {
  markers: Array<IMarker>;
  annotations: Array<IAnnotation>;
}

export const parseYamlValidations = (
  yamlInput: string,
  classes: any
): AceValidations => {
  const parsedValidations: AceValidations = {
    markers: [],
    annotations: [],
  };
  try {
    safeLoadAll(yamlInput);
  } catch (e) {
    const row = e.mark && e.mark.line ? e.mark.line : 0;
    const col = e.mark && e.mark.column ? e.mark.column : 0;
    const message = e.message ? e.message : '';
    parsedValidations.markers.push({
      startRow: row,
      startCol: 0,
      endRow: row + 1,
      endCol: 0,
      className: classes.validationError,
      type: 'fullLine',
    });
    parsedValidations.annotations.push({
      row,
      column: col,
      type: 'error',
      text: message,
    });
  }
  return parsedValidations;
};
