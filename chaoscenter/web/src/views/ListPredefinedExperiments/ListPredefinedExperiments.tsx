import React from 'react';
import { Button, Container, Layout, Text, useToaster } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import { parse } from 'yaml';
import { useParams } from 'react-router-dom';
import { useStrings } from '@strings';
import VisualizeExperimentManifestView from '@views/VisualizeExperimentManifest';
import { FaultList, InfrastructureType, PredefinedExperiment } from '@api/entities';
import type { ExperimentManifest } from '@models';
import experimentYamlService from 'services/experiment';
import type { CustomizedMultiSelectOption } from '@controllers/ListChaosHubsTab';
import config from '@config';
import { getScope } from '@utils';
import css from './ListPredefinedExperiments.module.scss';

interface ListPredefinedExperimentsViewProps {
  predefinedExperiments: PredefinedExperiment[] | undefined;
  hub: CustomizedMultiSelectOption;
  onClose: (manifest: ExperimentManifest) => void;
}
interface HubCardProps {
  hub: CustomizedMultiSelectOption;
  manifest: string;
  csv: string;
  onClose: (manifest: ExperimentManifest) => void;
}

export function PredefinedExperimentCard({ manifest, csv, onClose, hub }: HubCardProps): React.ReactElement {
  const [experimentExpanded, setFaultExpanded] = React.useState<boolean>(false);
  const { getString } = useStrings();
  const scope = getScope();
  const parsedCSV = parse(csv);
  const parsedManifest = parse(manifest) as ExperimentManifest;
  const { showError } = useToaster();
  const { experimentKey } = useParams<{ experimentKey: string }>();
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);

  const handleSelect = (event: React.MouseEvent<Element, MouseEvent>): void => {
    event.preventDefault();
    experimentHandler?.getExperiment(experimentKey).then(experiment => {
      const processedManifest = experimentHandler.preProcessExperimentManifest({
        manifest: parsedManifest,
        experimentName: experiment?.name ?? 'chaos-experiment',
        chaosInfrastructureID: experiment?.chaosInfrastructure?.id,
        chaosInfrastructureNamespace: experiment?.chaosInfrastructure?.namespace,
        imageRegistry: experiment?.imageRegistry
      });
      experimentHandler?.updateExperimentManifest(experimentKey, processedManifest);
      onClose(processedManifest);
    });
  };

  const handleExpanded = (trigger: boolean): void => {
    if (!manifest) showError(getString('manifestMissing'));
    else setFaultExpanded(trigger);
  };

  return (
    <div className={css.hubCard}>
      <div className={css.hubCardHeader} onClick={() => handleExpanded(!experimentExpanded)}>
        <img
          src={`${config.restEndpoints?.chaosManagerUri}/icon/${hub?.isDefault ? 'default' : scope.projectID}/${
            hub?.label
          }/predefined/${parsedCSV.metadata.name}.png`}
          height={25}
          width={25}
          alt={parsedCSV.metadata.name}
        />
        <div>
          <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>{parsedCSV.spec.displayName}</Text>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.GREY_600} margin={{ top: 'xsmall' }}>
            {parsedCSV.metadata.annotations.chartDescription}
          </Text>
        </div>
      </div>
      {experimentExpanded && parsedCSV.spec.faults && (
        <Container padding="medium" background={Color.PRIMARY_BG}>
          <Layout.Horizontal flex margin={{ bottom: 'small' }}>
            <Text font={{ variation: FontVariation.SMALL, weight: 'semi-bold' }} color={Color.GREY_600}>
              {getString('preview')}
            </Text>
            <Icon name="cross" size={20} onClick={() => setFaultExpanded(false)} color={Color.PRIMARY_7} />
          </Layout.Horizontal>
          <div className={css.previewCont}>
            <VisualizeExperimentManifestView manifest={parsedManifest} initialZoomLevel={0.6} />
          </div>
          <Text font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}>{getString('faults')}</Text>
          <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
            {parsedCSV.spec.faults.map((experiment: FaultList) => experiment.name).join(', ')}
          </Text>
          <Button
            intent="primary"
            margin={{ top: 'medium' }}
            onClick={e => {
              handleSelect(e);
            }}
          >
            {getString('useThisTemplate')}
          </Button>
        </Container>
      )}
    </div>
  );
}

export default function ListPredefinedExperimentsView({
  predefinedExperiments,
  hub,
  onClose
}: ListPredefinedExperimentsViewProps): React.ReactElement {
  if (!predefinedExperiments || (predefinedExperiments && predefinedExperiments.length === 0)) return <></>;

  return (
    <Container padding={{ top: 'small', bottom: 'small' }}>
      <Text font={{ variation: FontVariation.H3, weight: 'semi-bold' }}>{hub?.label}</Text>
      <Container margin={{ top: 'medium' }} className={css.hubCardMainCont}>
        {predefinedExperiments.map(experiment => (
          <PredefinedExperimentCard
            hub={hub}
            key={experiment.experimentName}
            manifest={experiment.experimentManifest}
            csv={experiment.experimentCSV}
            onClose={onClose}
          />
        ))}
      </Container>
    </Container>
  );
}
