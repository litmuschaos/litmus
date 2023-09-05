import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Layout, useToaster, Text, ButtonVariation, Button, ButtonSize, Tabs, Container } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { isEqual } from 'lodash-es';
import { Icon } from '@harnessio/icons';
import { Fallback } from '@errors';
import { useStrings } from '@strings';
import type { FaultProps } from '@models';
import { getIcon } from '@utils';
import { Mode, ProbeObj } from '@api/entities';
import ProbeCheck from '@images/ProbeCheck.png';
import ProbePropertiesController from '@controllers/ProbeProperties';
import type { ChaosProbesSelectionProps } from '@controllers/SelectProbesTab/types';
import ModeCard from './ModeCard';
import ModeDescription from './ModeDescription';
import css from './SelectProbeMode.module.scss';

export interface SelectProbeModeViewProps extends FaultProps {
  setIsModeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  probe: ChaosProbesSelectionProps | undefined;
}

function SelectProbeModeView({
  faultData,
  probe,
  onSave,
  setIsModeSelected
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
                    Choose Mode for probe to be executed
                  </Text>
                  <Layout.Horizontal flex>
                    <Layout.Vertical>
                      <ModeCard
                        name="Start of Test"
                        icon="play-circle"
                        isSelected={mode === Mode.SoT}
                        onClick={() => setMode(Mode.SoT)}
                      />
                      <ModeCard
                        name="End of Test"
                        icon="play-circle"
                        isSelected={mode === Mode.EoT}
                        onClick={() => setMode(Mode.EoT)}
                      />
                      <ModeCard
                        name="Edge"
                        icon="play-circle"
                        isSelected={mode === Mode.Edge}
                        onClick={() => setMode(Mode.Edge)}
                      />
                      <ModeCard
                        name="Continuous"
                        icon="play-circle"
                        isSelected={mode === Mode.Continuous}
                        onClick={() => setMode(Mode.Continuous)}
                      />
                      <ModeCard
                        name="onChaos"
                        icon="play-circle"
                        isSelected={mode === Mode.OnChaos}
                        onClick={() => setMode(Mode.OnChaos)}
                      />
                    </Layout.Vertical>
                    <Container className={css.preview}>
                      <Text
                        font={{ variation: FontVariation.BODY2, weight: 'bold' }}
                        margin={{ bottom: 'large' }}
                        color={Color.GREY_500}
                        lineClamp={1}
                      >
                        {getString('probeExecutionPreview')}
                      </Text>

                      {mode === Mode.SoT ? (
                        <ModeDescription
                          mode={getString('probeModes.SOTVerbose')}
                          description={getString('probeModes.SOTDesc')}
                        />
                      ) : mode === Mode.EoT ? (
                        <ModeDescription
                          mode={getString('probeModes.EOTVerbose')}
                          description={getString('probeModes.EOTDesc')}
                        />
                      ) : mode === Mode.Edge ? (
                        <ModeDescription
                          mode={getString('probeModes.Edge')}
                          description={getString('probeModes.EdgeDesc')}
                        />
                      ) : mode === Mode.Continuous ? (
                        <ModeDescription
                          mode={getString('probeModes.Continuous')}
                          description={getString('probeModes.ContinuousDesc')}
                        />
                      ) : (
                        <ModeDescription
                          mode={getString('probeModes.OnChaos')}
                          description={getString('probeModes.OnChaosDesc')}
                        />
                      )}

                      <img src={ProbeCheck} className={css.image} alt="Probe Check" />
                    </Container>
                  </Layout.Horizontal>
                </Layout.Vertical>
              )
            },
            {
              id: 'properties',
              title: 'Properties',
              panel: probe && <ProbePropertiesController probeName={probe.probeName} mode={mode} />
            }
          ]}
        />
      </Container>
    </>
  );
}

export default withErrorBoundary(SelectProbeModeView, { FallbackComponent: Fallback });
