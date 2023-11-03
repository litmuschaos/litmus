import React from 'react';
import { Button, Container, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';

import { useParams } from 'react-router-dom';
import { useStrings } from '@strings';
import { useSearchParams } from '@hooks';
import type { ExperimentManifest } from '@models';
import experimentYamlService from 'services/experiment';
import { InfrastructureType } from '@api/entities';
import blankCanvas from './images/blankCanvas.png';
import blankCanvasTemplate from './blankCanvasTemplate';

interface BlankCanvasProps {
  onClose: (manifest: ExperimentManifest) => void;
}

export default function BlankCanvas({ onClose }: BlankCanvasProps): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const { experimentKey } = useParams<{ experimentKey: string }>();
  const infrastructureType =
    (searchParams.get('infrastructureType') as InfrastructureType | undefined) ?? InfrastructureType.KUBERNETES;
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);

  const handleSelect = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.preventDefault();
    experimentHandler?.getExperiment(experimentKey).then(experiment => {
      const manifest = blankCanvasTemplate(experiment, infrastructureType);

      experimentHandler.updateExperimentManifest(experimentKey, manifest);
      onClose(manifest);
    });
  };

  return (
    <Container>
      <img src={blankCanvas} alt="Blank Canvas" height={364} width={289} />
      <Text font={{ variation: FontVariation.BODY1, weight: 'semi-bold' }}>{getString('blankCanvasTitle')}</Text>
      <Text font={{ variation: FontVariation.BODY }} margin={{ top: 'medium' }} color={Color.GREY_600}>
        {getString('blankCanvasDescription')}
      </Text>
      <Button
        text={getString('startWith')}
        intent="primary"
        margin={{ top: 'large' }}
        onClick={e => {
          handleSelect(e);
        }}
      />
    </Container>
  );
}
