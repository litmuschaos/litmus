import React from 'react';
import { ButtonVariation, Text, Container } from '@harnessio/uicore';
import { useParams } from 'react-router-dom';
import { parse, YAMLParseError } from 'yaml';
import Ajv from 'ajv';
import { Icon } from '@harnessio/icons';
import { Color } from '@harnessio/design-system';
import { getExperimentSchema, sanitize, yamlStringify } from '@utils';
import { useStrings } from '@strings';
import { useUpdateSearchParams, useSearchParams } from '@hooks';
import { ExperimentManifest, PermissionGroup, StudioErrorState } from '@models';
import experimentYamlService from 'services/experiment';
import type { InfrastructureType } from '@api/entities';
import type { Experiment } from '@db';
import RbacButton from '@components/RbacButton';
import YAMLBuilder from '@components/YAMLBuilder';
import css from './ExperimentYamlBuilder.module.scss';

interface YAMLError {
  message: string;
  line?: number;
  column?: number;
  type: 'syntax' | 'schema' | 'structure';
}

interface ExperimentYamlBuilderViewProps {
  setError: React.Dispatch<React.SetStateAction<StudioErrorState>>;
  setHasFaults: React.Dispatch<React.SetStateAction<boolean>>;
}

function ExperimentYamlBuilderView({ setError, setHasFaults }: ExperimentYamlBuilderViewProps): React.ReactElement {
  const { getString } = useStrings();
  const [isEditEnabled, setIsEditEnabled] = React.useState<boolean>(false);
  const [yamlErrors, setYamlErrors] = React.useState<YAMLError[]>([]);
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const hasUnsavedChangesInURL = searchParams.get('unsavedChanges') === 'true';
  const experimentName = searchParams.get('experimentName');
  const { experimentKey } = useParams<{ experimentKey: string }>();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType | undefined;
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(infrastructureType);
  const schema = getExperimentSchema(infrastructureType);
  const [currentExperiment, setCurrentExperiment] = React.useState<Experiment | undefined>();
  // Enable allErrors to get ALL validation errors, not just the first one
  const ajv = new Ajv({ allErrors: true, strict: false });

  // Helper to format user-friendly error messages
  const formatErrorMessage = (error: YAMLError): string => {
    const location =
      error.line !== undefined ? `Line ${error.line}${error.column !== undefined ? `, Col ${error.column}` : ''}` : '';
    const prefix = location ? `[${location}] ` : '';

    switch (error.type) {
      case 'syntax':
        return `${prefix}Syntax: ${error.message}`;
      case 'schema':
        return `${prefix}Validation: ${error.message}`;
      case 'structure':
        return `${prefix}Structure: ${error.message}`;
      default:
        return `${prefix}${error.message}`;
    }
  };

  const validateYaml = React.useCallback(
    (updatedYaml: string, save?: boolean) => {
      // Collect ALL errors in this array
      const allErrors: YAMLError[] = [];
      let parsedManifest;
      let manifest: ExperimentManifest | null = null;

      // Step 1: Try to parse YAML - catch syntax errors
      try {
        parsedManifest = parse(updatedYaml);
        manifest = sanitize(parsedManifest) as ExperimentManifest;
      } catch (error) {
        // Handle YAML parsing/syntax errors
        const yamlError: YAMLError = {
          message: error instanceof Error ? error.message : getString('yamlBuilder.yamlError'),
          type: 'syntax'
        };

        // Extract line/column info from YAMLParseError
        if (error instanceof YAMLParseError && error.linePos?.[0]) {
          yamlError.line = error.linePos[0].line;
          yamlError.column = error.linePos[0].col;
        }

        allErrors.push(yamlError);
      }

      // Step 2: If parsing succeeded, check schema validation errors
      if (manifest) {
        ajv.validate(schema, manifest);
        if (ajv.errors && ajv.errors.length > 0) {
          ajv.errors.forEach(error => {
            const path = error.instancePath || '';
            let message = error.message ?? 'Unknown validation error';

            // Make error messages more user-friendly
            if (path) {
              const readablePath = path.replace(/^\//g, '').replace(/\//g, ' → ');
              message = `"${readablePath}" ${message}`;
            }

            allErrors.push({
              message,
              type: 'schema'
            });
          });
        }
      }

      // Step 3: If no errors so far and saving, try to validate structure
      const hasErrors = allErrors.length > 0;

      if (!hasErrors && save && manifest) {
        try {
          // Validate manifest structure by checking if it has faults
          setHasFaults(experimentHandler?.doesExperimentHaveFaults(manifest) ?? false);

          // Save the manifest to idb
          experimentHandler?.updateExperimentManifest(experimentKey, manifest, true).then(experiment => {
            if (!hasUnsavedChangesInURL || experimentName !== experiment?.name)
              updateSearchParams({ unsavedChanges: 'true', experimentName: experiment?.name ?? 'chaos-experiment' });
          });
        } catch (saveError) {
          // Handle errors during save operations
          let errorMessage = saveError instanceof Error ? saveError.message : 'Failed to process experiment manifest';

          // Make common errors more user-friendly
          if (errorMessage.includes('templates.filter') || errorMessage.includes('steps')) {
            errorMessage =
              'Invalid workflow: Missing or malformed templates. Ensure your workflow has valid template definitions with steps.';
          } else if (errorMessage.includes('undefined') || errorMessage.includes('null')) {
            errorMessage = 'Incomplete manifest: Some required fields are missing or have invalid values.';
          }

          allErrors.push({ message: errorMessage, type: 'structure' });
        }
      }

      // Update state with all collected errors
      setYamlErrors(allErrors);

      // If errors exist, enable edit mode
      if (allErrors.length > 0) {
        setIsEditEnabled(true);
      }

      // Set error state to disable navigation/save
      setError(prevErrors => ({
        ...prevErrors,
        BUILDER: allErrors.length > 0
      }));
    },
    [
      schema,
      currentExperiment,
      ajv,
      experimentHandler,
      experimentKey,
      experimentName,
      getString,
      hasUnsavedChangesInURL,
      setError,
      setHasFaults,
      updateSearchParams
    ]
  );

  React.useEffect(() => {
    // validate yaml on page reload, get manifest from idb and copy to YAML builder
    experimentHandler?.getExperiment(experimentKey).then(experiment => {
      try {
        validateYaml(yamlStringify(experiment?.manifest), false);
      } catch (error) {
        // Silently handle initial validation errors
      }
      setCurrentExperiment(experiment);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentKey]);

  return (
    <div
      className={css.yamlBuilder}
      onDragEnter={e => {
        e.preventDefault();
      }}
      onDragOver={e => {
        e.preventDefault();
      }}
      onDrop={e => {
        e.preventDefault();
      }}
    >
      <YAMLBuilder
        schema={schema}
        key={isEditEnabled.toString()}
        fileName={`${experimentName}.yml`}
        height={yamlErrors.length > 0 ? 'calc(100vh - 320px)' : 'calc(100vh - 220px)'}
        width="100%"
        existingJSON={currentExperiment?.manifest}
        onChange={(_, updatedYaml) => {
          validateYaml(updatedYaml, true);
        }}
        yamlSanityConfig={{ removeEmptyObject: false, removeEmptyString: false, removeEmptyArray: false }}
        isReadOnlyMode={!isEditEnabled}
        isEditModeSupported={true}
      />
      {/* Error Console Panel */}
      {yamlErrors.length > 0 && (
        <Container className={css.errorConsole}>
          <Container className={css.errorConsoleHeader}>
            <Icon name="warning-sign" size={14} color={Color.RED_500} />
            <Text className={css.errorConsoleTitle}>
              {getString('problems')} ({yamlErrors.length})
            </Text>
          </Container>
          <Container className={css.errorConsoleBody}>
            {yamlErrors.map((error, index) => (
              <Container key={index} className={css.errorItem}>
                <Icon name="error" size={12} color={Color.RED_500} />
                <Text className={css.errorMessage}>{formatErrorMessage(error)}</Text>
              </Container>
            ))}
          </Container>
        </Container>
      )}
      <div className={css.buttonsWrapper}>
        {!isEditEnabled && (
          <RbacButton
            permission={PermissionGroup.OWNER}
            variation={ButtonVariation.SECONDARY}
            text={getString('editYaml')}
            onClick={() => {
              setIsEditEnabled(true);
            }}
          />
        )}
      </div>
    </div>
  );
}

export default ExperimentYamlBuilderView;
