import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { DropDown, Layout, Switch, Text, TextInput } from '@harnessio/uicore';
import { useParams } from 'react-router-dom';
import type { KubernetesExperimentManifest, WorkflowToleration } from '@models';
import { Fallback } from '@errors';
import Drawer from '@components/Drawer';
import { DrawerTypes } from '@components/Drawer/Drawer';
import { useStrings } from '@strings';
import { useSearchParams, useUpdateSearchParams } from '@hooks';
import experimentYamlService, { KubernetesYamlService } from 'services/experiment';
import { InfrastructureType } from '@api/entities';
import css from './ExperimentAdvancedTuningOptions.module.scss';

interface ExperimentAdvancedTuningOptionsViewProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AdvancedTuning {
  isNodeSelectorEnabled: boolean;
  isTolerationEnabled: boolean;
  nodeSelector: {
    key: string;
    value: string;
  };
  toleration: WorkflowToleration;
}

function ExperimentAdvancedTuningOptionsView({
  isOpen,
  onClose
}: ExperimentAdvancedTuningOptionsViewProps): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();
  const hasUnsavedChangesInURL = searchParams.get('unsavedChanges') === 'true';

  const setUnsavedChanges = (): void => {
    if (!hasUnsavedChangesInURL) updateSearchParams({ unsavedChanges: 'true' });
  };

  const [keyError, setKeyError] = React.useState<boolean>(false);

  const [advancedTuningOptions, setAdvancedTuningOptions] = React.useState<AdvancedTuning>({
    isNodeSelectorEnabled: false,
    isTolerationEnabled: false,
    nodeSelector: {
      key: '',
      value: ''
    },
    toleration: {
      effect: '',
      key: '',
      operator: '',
      value: ''
    }
  });

  const effectDropDownItems = [
    { label: 'NoExecute', value: 'NoExecute' },
    { label: 'NoSchedule', value: 'NoSchedule' },
    { label: 'PreferNoSchedule', value: 'PreferNoSchedule' }
  ];

  const operatorDropDownItems = [
    { label: 'Equal', value: 'Equal' },
    { label: 'Exists', value: 'Exists' }
  ];

  const { experimentKey } = useParams<{ experimentKey: string }>();
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);

  // Setting default value to IDB state
  React.useEffect(() => {
    experimentHandler?.getExperiment(experimentKey).then(experiment => {
      if (experiment) {
        setAdvancedTuningOptions({
          ...advancedTuningOptions,
          isNodeSelectorEnabled: (experimentHandler as KubernetesYamlService)?.doesNodeSelectorExist(
            experiment?.manifest as KubernetesExperimentManifest
          )[0],
          isTolerationEnabled: (experimentHandler as KubernetesYamlService)?.doesTolerationExist(
            experiment?.manifest as KubernetesExperimentManifest
          )[0],
          nodeSelector: (experimentHandler as KubernetesYamlService)?.doesNodeSelectorExist(
            experiment?.manifest as KubernetesExperimentManifest
          )[1],
          toleration: (experimentHandler as KubernetesYamlService)?.doesTolerationExist(
            experiment?.manifest as KubernetesExperimentManifest
          )[1]
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [experimentHandler, experimentKey]);

  const handleNodeSelector = (): void => {
    if (advancedTuningOptions.isNodeSelectorEnabled) {
      if (advancedTuningOptions.nodeSelector.key === '') setKeyError(true);
      else {
        setKeyError(false);
        (experimentHandler as KubernetesYamlService)
          ?.updateNodeSelector(experimentKey, advancedTuningOptions.nodeSelector, false)
          .then(() => {
            setUnsavedChanges();
          });
      }
    } else {
      setKeyError(false);
      (experimentHandler as KubernetesYamlService)
        ?.updateNodeSelector(experimentKey, advancedTuningOptions.nodeSelector, true)
        .then(() => {
          setUnsavedChanges();
        });
    }
  };

  const handleToleration = (): void => {
    if (advancedTuningOptions.isTolerationEnabled) {
      (experimentHandler as KubernetesYamlService)
        ?.updateToleration(experimentKey, advancedTuningOptions.toleration, false)
        .then(() => {
          setUnsavedChanges();
        });
    } else {
      (experimentHandler as KubernetesYamlService)
        ?.updateToleration(experimentKey, advancedTuningOptions.toleration, true)
        .then(() => {
          setUnsavedChanges();
        });
    }
  };

  React.useEffect(() => {
    handleNodeSelector();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedTuningOptions.isNodeSelectorEnabled, advancedTuningOptions.nodeSelector]);

  React.useEffect(() => {
    handleToleration();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [advancedTuningOptions.isTolerationEnabled, advancedTuningOptions.toleration]);

  const leftPanel = (
    <div className={css.root}>
      {/* Node Selector */}
      <Switch
        checked={advancedTuningOptions.isNodeSelectorEnabled}
        label={getString('nodeSelector')}
        className={css.switch}
        onChange={() => {
          setAdvancedTuningOptions({
            ...advancedTuningOptions,
            isNodeSelectorEnabled: !advancedTuningOptions.isNodeSelectorEnabled
          });
        }}
      />

      <Text className={css.subtitle}>{getString('nodeSelectorText')}</Text>

      <Layout.Horizontal className={css.option}>
        <TextInput
          value={advancedTuningOptions.nodeSelector.key}
          intent={keyError ? 'danger' : 'primary'}
          errorText="Key is required"
          placeholder={getString('nodeSelectorPlaceholderForKey')}
          onChange={event => {
            const target = event.target as HTMLInputElement;
            setAdvancedTuningOptions({
              ...advancedTuningOptions,
              nodeSelector: { ...advancedTuningOptions.nodeSelector, key: target.value }
            });
          }}
        />
        <div className={css.colon}>:</div>
        <TextInput
          defaultValue=""
          value={advancedTuningOptions.nodeSelector.value}
          placeholder={getString('nodeSelectorPlaceholderForValue')}
          onChange={event => {
            const target = event.target as HTMLInputElement;
            setAdvancedTuningOptions({
              ...advancedTuningOptions,
              nodeSelector: { ...advancedTuningOptions.nodeSelector, value: target.value }
            });
          }}
        />
      </Layout.Horizontal>

      {/* Toleration */}
      <Switch
        checked={advancedTuningOptions.isTolerationEnabled}
        label={getString('toleration.title')}
        className={css.switch}
        onChange={() => {
          setAdvancedTuningOptions({
            ...advancedTuningOptions,
            isTolerationEnabled: !advancedTuningOptions.isTolerationEnabled
          });
        }}
      />

      <Text className={css.subtitle}>{getString('tolerationText')}</Text>

      <Layout.Horizontal className={css.option}>
        <p>effect:</p>
        <DropDown
          items={effectDropDownItems}
          value={advancedTuningOptions.toleration.effect}
          placeholder={getString('toleration.effectPlaceholder')}
          className={css.dropdown}
          onChange={selectedItem => {
            setAdvancedTuningOptions({
              ...advancedTuningOptions,
              toleration: {
                ...advancedTuningOptions.toleration,
                effect: selectedItem.value as string
              }
            });
          }}
        />
      </Layout.Horizontal>

      <Layout.Horizontal className={css.option}>
        <p>key:</p>
        <TextInput
          defaultValue=""
          value={advancedTuningOptions.toleration.key}
          placeholder={getString('toleration.keyPlaceholder')}
          onChange={event => {
            const target = event.target as HTMLInputElement;
            setAdvancedTuningOptions({
              ...advancedTuningOptions,
              toleration: {
                ...advancedTuningOptions.toleration,
                key: target.value
              }
            });
          }}
        />
      </Layout.Horizontal>

      <Layout.Horizontal className={css.option}>
        <p>operator:</p>
        <DropDown
          items={operatorDropDownItems}
          value={advancedTuningOptions.toleration.operator}
          placeholder={getString('toleration.operatorPlaceholder')}
          className={css.dropdown}
          onChange={selectedItem => {
            setAdvancedTuningOptions({
              ...advancedTuningOptions,
              toleration: {
                ...advancedTuningOptions.toleration,
                operator: selectedItem.value as string
              }
            });
          }}
        />
      </Layout.Horizontal>

      <Layout.Horizontal className={css.option}>
        <p>value:</p>
        <TextInput
          defaultValue=""
          value={advancedTuningOptions.toleration.value}
          placeholder={getString('valuePlaceholder')}
          onChange={event => {
            const target = event.target as HTMLInputElement;
            setAdvancedTuningOptions({
              ...advancedTuningOptions,
              toleration: {
                ...advancedTuningOptions.toleration,
                value: target.value
              }
            });
          }}
        />
      </Layout.Horizontal>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      leftPanel={leftPanel}
      handleClose={() => onClose()}
      title={getString('advancedOptions')}
      type={DrawerTypes.AdvacedOptions}
    />
  );
}

export default withErrorBoundary(ExperimentAdvancedTuningOptionsView, { FallbackComponent: Fallback });
