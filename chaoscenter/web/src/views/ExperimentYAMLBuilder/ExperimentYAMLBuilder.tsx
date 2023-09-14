import React from 'react';
import { ButtonVariation } from '@harnessio/uicore';
import { useParams } from 'react-router-dom';
import { parse } from 'yaml';
import Ajv from 'ajv';
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

interface ExperimentYamlBuilderViewProps {
  setError: React.Dispatch<React.SetStateAction<StudioErrorState>>;
  setHasFaults: React.Dispatch<React.SetStateAction<boolean>>;
}

function ExperimentYamlBuilderView({ setError, setHasFaults }: ExperimentYamlBuilderViewProps): React.ReactElement {
  const { getString } = useStrings();
  const [isEditEnabled, setIsEditEnabled] = React.useState<boolean>(false);
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const hasUnsavedChangesInURL = searchParams.get('unsavedChanges') === 'true';
  const experimentName = searchParams.get('experimentName');
  const { experimentKey } = useParams<{ experimentKey: string }>();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType | undefined;
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(infrastructureType);
  const schema = getExperimentSchema(infrastructureType);
  const [currentExperiment, setCurrentExperiment] = React.useState<Experiment | undefined>();
  const ajv = new Ajv({ allErrors: true, strict: false });

  const validateYaml = React.useCallback(
    (updatedYaml: string, save?: boolean) => {
      const parsedManifest = parse(updatedYaml);
      const manifest = sanitize(parsedManifest) as ExperimentManifest;
      // check if there are errors in yaml
      ajv.validate(schema, manifest);
      const errors = ajv.errors?.map(error => {
        return {
          path: error.instancePath ?? '',
          message: error.message ?? '',
          params: error.params ?? {}
        };
      });
      const hasErrors = errors !== undefined;
      // if errors are there open editor in edit mode
      hasErrors && setIsEditEnabled(true);
      // set errors to disable navigation to visual tab and save button
      setError(prevErrors => ({
        ...prevErrors,
        BUILDER: hasErrors
      }));
      // if manifest has not changed or there are no error early return
      if (hasErrors || !save) return;
      // if no errors parse manifest and save
      // set faults number based on manifest to disable saving of manifest if there are no faults
      setHasFaults(experimentHandler?.doesExperimentHaveFaults(manifest) ?? false);
      // save the manifest to idb
      experimentHandler?.updateExperimentManifest(experimentKey, manifest, true).then(experiment => {
        // if url doesn't have unsaved changes or experiment name is missing, add them to search params
        if (!hasUnsavedChangesInURL || experimentName !== experiment?.name)
          updateSearchParams({ unsavedChanges: 'true', experimentName: experiment?.name ?? 'chaos-experiment' });
      });
    },
    [schema, currentExperiment]
  );

  React.useEffect(() => {
    // validate yaml on page reload, get manifest from idb and copy to YAML builder
    experimentHandler?.getExperiment(experimentKey).then(experiment => {
      validateYaml(yamlStringify(experiment?.manifest), false);
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
        height="calc(100vh - 220px)"
        width="100%"
        existingJSON={currentExperiment?.manifest}
        onChange={(_, updatedYaml) => {
          validateYaml(updatedYaml, true);
        }}
        yamlSanityConfig={{ removeEmptyObject: false, removeEmptyString: false, removeEmptyArray: false }}
        isReadOnlyMode={!isEditEnabled}
        isEditModeSupported={true}
      />
      <div className={css.buttonsWrapper}>
        {!isEditEnabled && (
          <RbacButton
            permission={PermissionGroup.EDITOR}
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
