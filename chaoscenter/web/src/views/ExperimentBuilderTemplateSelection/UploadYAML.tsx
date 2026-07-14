import React from 'react';
import { Button, ButtonVariation, Container, Text, useToaster } from '@harnessio/uicore';
import { parse } from 'yaml';
import { Color, FontVariation } from '@harnessio/design-system';
import { useParams } from 'react-router-dom';
import { useStrings } from '@strings';
import { useSearchParams } from '@hooks';
import { fileUpload } from '@utils';
import type { ExperimentManifest } from '@models';
import experimentYamlService from 'services/experiment';
import type { InfrastructureType } from '@api/entities';
import uploadYAML from './images/uploadYAML.png';
import css from './ExperimentBuilderTemplateSelection.module.scss';

interface UploadYAMLProps {
  onClose: (manifest: ExperimentManifest, yamlUploaded?: boolean) => void;
}

export default function UploadYAML({ onClose }: UploadYAMLProps): React.ReactElement {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const { experimentKey } = useParams<{ experimentKey: string }>();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType | undefined;
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(infrastructureType);

  const { showError } = useToaster();

  const onUpload = (response: string): void => {
    experimentHandler
      ?.getExperiment(experimentKey)
      .then(experiment => {
        const processedManifest = experimentHandler.preProcessExperimentManifest({
          manifest: parse(response) as ExperimentManifest,
          experimentName: experiment?.name ?? 'chaos-experiment',
          chaosInfrastructureID: experiment?.chaosInfrastructure?.id,
          chaosInfrastructureNamespace: experiment?.chaosInfrastructure?.namespace,
          imageRegistry: experiment?.imageRegistry
        });
        experimentHandler?.updateExperimentManifest(experimentKey, processedManifest);
        onClose(processedManifest, true);
      })
      .catch(() => showError('errorInYamlDescription'));
  };

  const onUploadError = (err: string): void => {
    showError(err);
  };

  // Function to handle when a File is dragged on the editor
  const handleDrag = (e: React.DragEvent<HTMLDivElement>): void => {
    e.stopPropagation();
    e.preventDefault();

    Array.from(e.dataTransfer.files)
      .filter(file => file.name.split('.')[1] === 'yaml' || file.name.split('.')[1] === 'yml')
      .forEach(async file => {
        file
          .text()
          .then(response => {
            onUpload(response);
          })
          .catch(err => {
            onUploadError(err);
          });
      });
  };

  return (
    <Container>
      <input
        ref={inputRef}
        type="file"
        accept=".yaml,.yml"
        style={{ display: 'none' }}
        onChange={e => fileUpload(e, onUpload, onUploadError)}
      />
      <div
        onDragEnter={e => {
          e.preventDefault();
        }}
        onDragOver={e => {
          e.preventDefault();
        }}
        onDrop={handleDrag}
        className={css.dragContainer}
      >
        <img src={uploadYAML} alt="Upload YAML" height={146} width={172} draggable={false} />
        <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600} margin={{ top: 'large' }}>
          {getString('uploadYAMLDragText')}
        </Text>
        <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_400} margin={{ top: 'medium' }}>
          {getString('or')}
        </Text>
        <Button
          variation={ButtonVariation.SECONDARY}
          text={getString('uploadYAMLButton')}
          margin={{ top: 'medium' }}
          onClick={e => {
            e.preventDefault();
            inputRef.current?.click();
          }}
        />
      </div>
      <Text font={{ variation: FontVariation.BODY1, weight: 'semi-bold' }}>{getString('uploadYAMLTitleBuilder')}</Text>
      <Text font={{ variation: FontVariation.BODY }} margin={{ top: 'medium' }} color={Color.GREY_600}>
        {getString('uploadYAMLDescriptionBuilder')}
      </Text>
    </Container>
  );
}
