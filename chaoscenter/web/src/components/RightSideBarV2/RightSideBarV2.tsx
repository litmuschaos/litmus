import React from 'react';
import { Container, Layout, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Classes } from '@blueprintjs/core';
import { useStrings } from '@strings';
import {
  CloneExperimentButton,
  DownloadExperimentButton,
  EditExperimentButton,
  EnableDisableCronButton,
  RunExperimentButton,
  StopExperimentButton,
  StopExperimentRunButton
} from '@components/ExperimentActionButtons';
import type { RefetchExperimentRuns, RefetchExperiments } from '@controllers/ExperimentDashboardV2';
import { ExperimentRunStatus, ExperimentType, InfrastructureType } from '@api/entities';

interface RightSideBarViewV2Props extends Partial<RefetchExperiments>, Partial<RefetchExperimentRuns> {
  experimentID: string;
  experimentRunID?: string;
  notifyID?: string;
  experimentType?: ExperimentType;
  phase: ExperimentRunStatus | undefined;
  loading?: boolean;
  isCronEnabled?: boolean;
  isEditMode?: boolean;
}

function RightSideBarV2({
  experimentID,
  experimentRunID,
  notifyID,
  experimentType,
  phase,
  loading,
  isEditMode,
  isCronEnabled,
  refetchExperiments,
  refetchExperimentRuns
}: RightSideBarViewV2Props): React.ReactElement {
  const { getString } = useStrings();
  const showStopButton = phase === ExperimentRunStatus.RUNNING || phase === ExperimentRunStatus.QUEUED;

  const showEnableDisableCronButton =
    experimentType && experimentType === ExperimentType.CRON && isCronEnabled !== undefined;

  return (
    <Layout.Vertical
      height={'100%'}
      padding={{ top: 'large', bottom: 'large' }}
      flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
      spacing={'xlarge'}
      className={loading ? Classes.SKELETON : ''}
    >
      {showEnableDisableCronButton && (
        // <!-- enable/disable button for cron experiments -->
        <Container>
          <Layout.Vertical flex={{ justifyContent: 'center' }} spacing={'small'}>
            <EnableDisableCronButton
              tooltipProps={{ disabled: true }}
              experimentID={experimentID}
              refetchExperiments={refetchExperiments}
              isCronEnabled={isCronEnabled}
            />
            <Text
              style={{ textAlign: 'center' }}
              width={40}
              color={Color.GREY_500}
              font={{ variation: FontVariation.TINY_SEMI }}
            >
              {isCronEnabled ? getString('disableCron') : getString('enableCron')}
            </Text>
          </Layout.Vertical>
        </Container>
      )}

      {showStopButton ? (
        experimentRunID || notifyID ? (
          // <!-- stop button for experiment run (specific run details page) -->
          <Container>
            <Layout.Vertical flex={{ justifyContent: 'center' }} spacing={'small'}>
              <StopExperimentRunButton
                tooltipProps={{ disabled: true }}
                notifyID={notifyID}
                experimentID={experimentID}
                experimentRunID={experimentRunID}
                refetchExperimentRuns={refetchExperimentRuns}
                infrastructureType={InfrastructureType.KUBERNETES}
              />
              <Text
                style={{ textAlign: 'center' }}
                width={40}
                color={Color.GREY_500}
                font={{ variation: FontVariation.TINY_SEMI }}
              >
                {getString('stop')}
              </Text>
            </Layout.Vertical>
          </Container>
        ) : (
          // <!-- stop button for experiment (runs history page) -->
          <Container>
            <Layout.Vertical flex={{ justifyContent: 'center' }} spacing={'small'}>
              <StopExperimentButton
                tooltipProps={{ disabled: true }}
                experimentID={experimentID}
                refetchExperiments={refetchExperiments}
                infrastructureType={InfrastructureType.KUBERNETES}
              />
              <Text
                style={{ textAlign: 'center' }}
                color={Color.GREY_500}
                font={{ variation: FontVariation.TINY_SEMI }}
              >
                {getString('stop')}
              </Text>
            </Layout.Vertical>
          </Container>
        )
      ) : (
        // <!-- Re-run button -->
        experimentType === ExperimentType.NON_CRON && (
          <Container>
            <Layout.Vertical flex={{ justifyContent: 'center' }} spacing={'small'}>
              <RunExperimentButton
                tooltipProps={{ disabled: true }}
                experimentID={experimentID}
                refetchExperiments={refetchExperiments}
                // buttonProps={{ disabled: phase === ExperimentRunStatus.QUEUED }}
              />
              <Text
                style={{ textAlign: 'center' }}
                color={Color.GREY_500}
                font={{ variation: FontVariation.TINY_SEMI }}
              >
                {getString('run')}
              </Text>
            </Layout.Vertical>
          </Container>
        )
      )}

      {/* <!-- divider --> */}
      {(experimentType === ExperimentType.NON_CRON || showEnableDisableCronButton) && (
        <div style={{ border: '1px solid var(--grey-200)', height: 1, width: '80%' }} />
      )}

      {/* <!-- edit experiment button --> */}
      {!isEditMode && (
        <Container>
          <Layout.Vertical flex={{ justifyContent: 'center' }} spacing={'small'}>
            <EditExperimentButton experimentID={experimentID} />
            <Text style={{ textAlign: 'center' }} color={Color.GREY_500} font={{ variation: FontVariation.TINY_SEMI }}>
              {getString('edit')}
            </Text>
          </Layout.Vertical>
        </Container>
      )}

      <Container>
        <Layout.Vertical flex={{ justifyContent: 'center' }} spacing={'small'}>
          <CloneExperimentButton experimentID={experimentID} />
          <Text style={{ textAlign: 'center' }} color={Color.GREY_500} font={{ variation: FontVariation.TINY_SEMI }}>
            {getString('clone')}
          </Text>
        </Layout.Vertical>
      </Container>

      {/* <!-- divider --> */}
      <div style={{ border: '1px solid var(--grey-200)', height: 1, width: '80%' }} />

      {/* <!-- download experiment button --> */}
      <Container>
        <Layout.Vertical flex={{ justifyContent: 'center' }} spacing={'small'}>
          <DownloadExperimentButton experimentID={experimentID} />
          <Text style={{ textAlign: 'center' }} color={Color.GREY_500} font={{ variation: FontVariation.TINY_SEMI }}>
            {getString('downloadExperiment')}
          </Text>
        </Layout.Vertical>
      </Container>
    </Layout.Vertical>
  );
}

export default RightSideBarV2;
