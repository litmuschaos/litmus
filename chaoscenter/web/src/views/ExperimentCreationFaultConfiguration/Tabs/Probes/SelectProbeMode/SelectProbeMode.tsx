import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Layout, useToaster, Text, ButtonVariation, Button, ButtonSize, Tabs, Container } from '@harnessio/uicore';
import { FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import { Fallback } from '@errors';
import { useStrings } from '@strings';
import type { FaultProps } from '@models';
import { getIcon } from '@utils';
import { Mode, ProbeObj } from '@api/entities';
import ProbePropertiesController from '@controllers/ProbeProperties';
import type { ChaosProbesSelectionProps } from '@controllers/SelectProbesTab/types';
import { updateAttachedProbes } from '../probeAttachment';
import ModeCard from './ModeCard';
import css from './SelectProbeMode.module.scss';

export interface SelectProbeModeViewProps extends FaultProps {
  setIsModeSelected: React.Dispatch<React.SetStateAction<boolean>>;
  probe: ChaosProbesSelectionProps | undefined;
  // Set when the drawer is changing a probe that is already attached to this fault.
  editingProbe?: ProbeObj;
  isModeSelected: boolean;
}

function SelectProbeModeView({
  faultData,
  probe,
  editingProbe,
  onSave,
  setIsModeSelected,
  isModeSelected
}: SelectProbeModeViewProps): React.ReactElement {
  const { getString } = useStrings();
  const { showError, showSuccess } = useToaster();
  const [mode, setMode] = React.useState<Mode>(editingProbe?.mode ?? Mode.SoT);
  const probeName = editingProbe?.name ?? probe?.probeName;
  // The fault attachment stores name and mode only, so an edit has no probe type to icon.
  const probeType = editingProbe ? undefined : probe?.type;

  // The drawer stays mounted, so the mode has to be reset each time it opens.
  React.useEffect(() => {
    if (isModeSelected) {
      setMode(editingProbe?.mode ?? Mode.SoT);
    }
  }, [editingProbe, isModeSelected]);

  const applyChanges = (): void => {
    if (!faultData || !probeName) return;

    const nextProbe: ProbeObj = { name: probeName, mode };
    const { probes, duplicate } = updateAttachedProbes(
      faultData.probes as ProbeObj[] | undefined,
      nextProbe,
      editingProbe
    );

    if (duplicate) {
      showError(`${nextProbe.name} ${getString('probeModeAlreadyExists')}`);
      return;
    }

    onSave({ ...faultData, probes });
    showSuccess(getString(editingProbe ? 'probeUpdatedSuccessfully' : 'probeAddedSuccessfully'));
    setIsModeSelected(false);
  };

  const discardChanges = (): void => {
    setIsModeSelected(false);
  };

  return (
    <>
      <Layout.Horizontal padding={{ top: 'large', left: 'medium', right: 'medium', bottom: 'large' }} flex>
        <Layout.Horizontal spacing={'medium'}>
          {probeType && <Icon name={getIcon(probeType)} size={25} />}

          <Text font={{ variation: FontVariation.H5, weight: 'bold' }} lineClamp={1}>
            {probeName}
          </Text>
        </Layout.Horizontal>

        {probeName && (
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
              panel: probeName ? (
                <ProbePropertiesController probeName={probeName} mode={mode} isModeSelected={isModeSelected} />
              ) : undefined
            }
          ]}
        />
      </Container>
    </>
  );
}

export default withErrorBoundary(SelectProbeModeView, { FallbackComponent: Fallback });
