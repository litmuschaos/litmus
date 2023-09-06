import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Layout, useToaster, Text, ButtonVariation, Button, ButtonSize, Tabs, Container } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import { isEqual } from 'lodash-es';
import { Icon } from '@harnessio/icons';
import { Fallback } from '@errors';
import { useStrings } from '@strings';
import type { FaultProps } from '@models';
import { getIcon } from '@utils';
import { Mode, ProbeObj } from '@api/entities';
import ProbePropertiesController from '@controllers/ProbeProperties';
import type { ChaosProbesSelectionProps } from '@controllers/SelectProbesTab/types';
import ModeCard from './ModeCard';
import css from './SelectProbeMode.module.scss';

export interface SelectProbeModeViewProps extends FaultProps {
  setIsModeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  probe: ChaosProbesSelectionProps | undefined;
  isModeSelected: boolean;
}

function SelectProbeModeView({
  faultData,
  probe,
  onSave,
  setIsModeSelected,
  isModeSelected
}: SelectProbeModeViewProps): React.ReactElement {
  const { getString } = useStrings();
  const { showError, showSuccess } = useToaster();
  const isValid = React.useRef<boolean>(true);
  const [mode, setMode] = React.useState<Mode>(Mode.SoT);

  const applyChanges = (): void => {
    if (!faultData || !probe) return;

    const newProbe: ProbeObj = { name: probe.probeName, mode };

    // Validate if the probe with the same mode already exists
    if (faultData.probes?.some(p => isEqual(p, newProbe))) {
      showError(`${newProbe.name} ${getString('probeModeAlreadyExists')}`);
      isValid.current = false;
      return;
    }

    isValid.current = true;
    if (faultData.probes) faultData.probes.push(newProbe);
    else faultData.probes = [newProbe];

    // Update faultData
    onSave(faultData);
    showSuccess(getString('probeAddedSuccessfully'));
    setIsModeSelected(false);
  };

  const discardChanges = (): void => {
    setIsModeSelected(false);
  };

  return (
    <>
      <Layout.Horizontal padding={{ top: 'large', left: 'medium', right: 'medium', bottom: 'large' }} flex>
        <Layout.Horizontal spacing={'medium'}>
          {probe && <Icon name={getIcon(probe.type)} size={25} />}

          <Text font={{ variation: FontVariation.H5, weight: 'bold' }} lineClamp={1}>
            {probe?.probeName}
          </Text>
        </Layout.Horizontal>

        {probe?.probeName && (
          <Layout.Horizontal spacing={'medium'}>
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('applyChanges')}
              size={ButtonSize.SMALL}
              onClick={applyChanges}
            />
            <Button
              variation={ButtonVariation.SECONDARY}
              text={getString('discard')}
              onClick={discardChanges}
              size={ButtonSize.SMALL}
            />
          </Layout.Horizontal>
        )}
      </Layout.Horizontal>

      <Container className={css.tabs}>
        <Tabs
          id={'probeTabs'}
          defaultSelectedTabId={'mode'}
          tabList={[
            {
              id: 'mode',
              title: 'Mode',
              panel: (
                <Layout.Vertical padding={{ top: 'large', left: 'medium', right: 'medium', bottom: 'large' }}>
                  <Text
                    font={{ variation: FontVariation.BODY2, weight: 'bold' }}
                    margin={{ bottom: 'large' }}
                    lineClamp={1}
                  >
                    {getString('chooseProbeMode')}
                  </Text>
                  <Layout.Horizontal flex>
                    <Layout.Vertical>
                      <ModeCard
                        name={getString('probeModes.SOTVerbose')}
                        description={getString('probeModes.SOTDesc')}
                        icon="probe-SOT"
                        isSelected={mode === Mode.SoT}
                        onClick={() => setMode(Mode.SoT)}
                      />
                      <ModeCard
                        name={getString('probeModes.EOTVerbose')}
                        description={getString('probeModes.EOTDesc')}
                        icon="probe-EOT"
                        isSelected={mode === Mode.EoT}
                        onClick={() => setMode(Mode.EoT)}
                      />
                      <ModeCard
                        name={getString('probeModes.Edge')}
                        description={getString('probeModes.EdgeDesc')}
                        icon="probe-edge"
                        isSelected={mode === Mode.Edge}
                        onClick={() => setMode(Mode.Edge)}
                      />
                      <ModeCard
                        name={getString('probeModes.Continuous')}
                        description={getString('probeModes.ContinuousDesc')}
                        icon="probe-continuos"
                        isSelected={mode === Mode.Continuous}
                        onClick={() => setMode(Mode.Continuous)}
                      />
                      <ModeCard
                        name={getString('probeModes.OnChaos')}
                        description={getString('probeModes.OnChaosDesc')}
                        icon="probe-onChaos"
                        isSelected={mode === Mode.OnChaos}
                        onClick={() => setMode(Mode.OnChaos)}
                      />
                    </Layout.Vertical>
                  </Layout.Horizontal>
                </Layout.Vertical>
              )
            },
            {
              id: 'properties',
              title: 'Properties',
              panel: probe && (
                <ProbePropertiesController probeName={probe.probeName} mode={mode} isModeSelected={isModeSelected} />
              )
            }
          ]}
        />
      </Container>
    </>
  );
}

export default withErrorBoundary(SelectProbeModeView, { FallbackComponent: Fallback });
