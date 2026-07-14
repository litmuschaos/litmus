import { useHistory } from 'react-router-dom';
import { parse } from 'yaml';
import { useToaster } from '@harnessio/uicore';
import { Chart, InfrastructureType, PredefinedExperiment } from '@api/entities';
import type { ExperimentManifest } from '@models';
import { useStrings } from '@strings';
import { getHash } from 'utils/getHash';
import experimentYamlService from 'services/experiment';
import { getInfrastructureTypeFromExperimentKind } from '@utils';
import { useRouteWithBaseUrl } from './useRouteWithBaseUrl';

export function useLaunchExperimentFromHub(predefinedExperiment: PredefinedExperiment | undefined): () => void {
  const history = useHistory();
  const { showError } = useToaster();
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();

  const manifest = parse(predefinedExperiment?.experimentManifest ?? '') as ExperimentManifest;
  const chart = parse(predefinedExperiment?.experimentCSV ?? '') as Chart;
  if (!manifest) showError(getString('manifestMissing'));

  const infrastructureType = getInfrastructureTypeFromExperimentKind(manifest);
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);
  const experimentID = getHash();

  return function launchExperiment(): void {
    experimentHandler?.updateExperimentDetails(experimentID ?? 'chaos-experiment', {
      name: manifest.metadata.name,
      description: chart.metadata.annotations.chartDescription
    });
    manifest.metadata.name && experimentHandler?.updateExperimentManifest(experimentID, manifest);
    history.push({
      pathname: paths.toNewExperiment({ experimentKey: experimentID }),
      search: `?experimentKey=${manifest.metadata.name}&infrastructureType=${infrastructureType}`
    });
  };
}
