import React from 'react';
import { Color, FontVariation } from '@harnessio/design-system';
import { Container, Utils, Layout, Tabs, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import type { TabId } from '@blueprintjs/core';
import {
  getDurationBetweenTwoDates,
  getPropsBasedOnExperimentRunFaultStatus,
  handleTimestampAmbiguity,
  isValidNodeType,
  phaseToUI
} from '@utils';
import { ExperimentRunFaultStatus, ExperimentRunStatus, FaultProbeStatus, Node } from '@api/entities';
import ProbePassedFailedCount, { ProbeTitleIcon } from '@components/ProbePassedFailedCount';
import { useStrings } from '@strings';
import type { ErrorOutput, FailureOutput } from '@models';
import LogsTabController from '@controllers/LogsTab';
import Duration from '@components/Duration';
import type { ProbeInRuns } from '@api/core';
import FaultConfigurationTab from './Tabs/FaultConfigurationTab';
import ProbesTab from './Tabs/ProbesTab';
import css from './ExperimentRunDetailsPanel.module.scss';

interface ExperimentRunDetailsPanelProps extends DetailsTabProps {
  probeData: ProbeInRuns[] | undefined;
  setSelectedNodeID: React.Dispatch<React.SetStateAction<string>>;
}

interface DetailsTabProps {
  node: Node | undefined;
  probeData: ProbeInRuns[] | undefined;
  experimentRunID: string | undefined;
  infraID: string | undefined;
  namespace: string | undefined;
  phase: ExperimentRunStatus | undefined;
  podID: string;
  manifest?: string;
  loading: boolean | undefined;
}

const DetailsTabs = ({
  node,
  namespace,
  phase,
  experimentRunID,
  infraID,
  podID,
  manifest,
  probeData,
  loading
}: DetailsTabProps): React.ReactElement => {
  const { getString } = useStrings();

  const chaosResult = node?.chaosData?.chaosResult;
  const [tabValue, setTabValue] = React.useState<TabId | undefined>(
    node?.phase === ExperimentRunFaultStatus.RUNNING ? 'logsTab' : 'probesTab'
  );
  return (
    <Tabs
      id={'faultDetailsTab'}
      onChange={tabID => setTabValue(tabID)}
      selectedTabId={!isValidNodeType(node?.type ?? '') ? 'logsTab' : tabValue}
      tabList={
        node && [
          {
            id: 'probesTab',
            title: getString('probes'),
            hidden: !isValidNodeType(node?.type),
            panel: (
              <ProbesTab
                loading={loading}
                probeData={probeData}
                manifest={manifest}
                nodeName={node?.name}
                probeStatuses={chaosResult?.status?.probeStatuses}
              />
            )
          },
          {
            id: 'logsTab',
            title: getString('logs'),
            panel: (
              <LogsTabController
                key={node.chaosData?.faultPod ?? podID}
                chaosData={node.chaosData}
                nodeType={node.type}
                namespace={namespace}
                phase={phase}
                workflowRunID={experimentRunID}
                infraID={infraID}
                podID={podID}
              />
            )
          },
          {
            id: 'faultConfigurationTab',
            title: getString('faultConfiguration'),
            hidden: !isValidNodeType(node?.type),
            panel: <FaultConfigurationTab loading={loading} manifest={manifest} nodeName={node?.name} />
          }
        ]
      }
    />
  );
};

const ExperimentRunDetailsPanel = ({
  node,
  experimentRunID,
  phase,
  namespace,
  infraID,
  probeData,
  podID,
  manifest,
  loading,
  setSelectedNodeID
}: ExperimentRunDetailsPanelProps): React.ReactElement => {
  const { getString } = useStrings();

  const passedFailedRuns = (): { passed: number; failed: number } => {
    let passedCount = 0;
    let failedCount = 0;
    if (node?.chaosData?.chaosResult) {
      node?.chaosData?.chaosResult?.status?.probeStatuses?.map(status => {
        if (status?.status?.verdict === FaultProbeStatus.PASSED) passedCount++;
        if (status?.status?.verdict === FaultProbeStatus.FAILED) failedCount++;
      });
    }
    return {
      passed: passedCount,
      failed: failedCount
    };
  };
  const faultVerdict =
    node?.chaosData?.chaosResult?.status?.experimentStatus?.failureOutput ??
    node?.chaosData?.chaosResult?.status?.experimentStatus?.errorOutput;
  const nodePhase = node?.phase ?? ExperimentRunFaultStatus.NA;
  const { color, iconName, iconColor } = getPropsBasedOnExperimentRunFaultStatus(nodePhase);
  const wasFaultStopped = nodePhase === ExperimentRunFaultStatus.STOPPED || nodePhase === ExperimentRunFaultStatus.NA;
  const faultStartTime = parseInt(handleTimestampAmbiguity(node?.startedAt ?? ''));
  const faultEndTime =
    wasFaultStopped && !node?.finishedAt
      ? parseInt(handleTimestampAmbiguity(node?.startedAt ?? ''))
      : parseInt(handleTimestampAmbiguity(node?.finishedAt ?? ''));
  return node ? (
    <Container className={css.logSectionContainer} background={Color.WHITE}>
      <Layout.Vertical spacing="small" className={css.tabsMainContainer}>
        <div className={css.upperContainer}>
          {/* Fault name, status and cross button */}
          <Layout.Horizontal flex>
            <Layout.Horizontal flex>
              <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREY_500}>
                {isValidNodeType(node.type) ? getString('fault') : 'Step'}:{'   '}
                <span className={css.resetFontColor}>{node?.name}</span>
              </Text>
              <Layout.Horizontal flex={{ alignItems: 'center' }} spacing={'small'}>
                {iconName && (
                  <Icon name={iconName} style={{ color: Utils.getRealCSSColor(iconColor ?? color) }} size={15} />
                )}
                <Text font={{ size: 'normal', weight: 'semi-bold' }} color={color}>
                  {phaseToUI(nodePhase)}
                </Text>
              </Layout.Horizontal>
            </Layout.Horizontal>
            <Icon name="cross" size={25} onClick={() => setSelectedNodeID('')} className={css.cursorPointer} />
          </Layout.Horizontal>
          {/* Probe Results */}
          {isValidNodeType(node.type) && (
            <Container flex={{ justifyContent: 'space-between', alignItems: 'center' }} className={css.probeResults}>
              <Layout.Horizontal>
                <Layout.Horizontal flex={{ alignItems: 'center' }} spacing={'small'}>
                  <ProbeTitleIcon />
                  <Text font={{ size: 'normal', weight: 'semi-bold' }} color={Color.GREY_700}>
                    {getString('probeResult')}
                  </Text>
                  {node && node?.chaosData && node?.chaosData?.chaosResult && (
                    <Text font={{ size: 'small' }} color={Color.GREY_600}>
                      ({getString('total')} {node?.chaosData?.chaosResult?.status?.probeStatuses?.length})
                    </Text>
                  )}
                </Layout.Horizontal>
              </Layout.Horizontal>
              <Layout.Horizontal margin={{ right: 'xxlarge' }}>
                <ProbePassedFailedCount
                  phase={nodePhase}
                  flexStart={true}
                  passedCount={passedFailedRuns().passed}
                  failedCount={passedFailedRuns().failed}
                />
              </Layout.Horizontal>
            </Container>
          )}
          {/* fault start time, end time and duration */}
          <Container padding={{ top: 'medium', bottom: 'xsmall' }}>
            <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <Text width={100} font={{ variation: FontVariation.BODY2 }} color={Color.GREY_500}>
                {getString('duration')}:
              </Text>
              <Layout.Horizontal spacing={'small'}>
                <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_800} lineClamp={1}>
                  {getDurationBetweenTwoDates(faultStartTime, faultEndTime)}
                </Text>
                <Duration
                  startTime={faultStartTime}
                  endTime={faultEndTime}
                  icon={(isNaN(faultStartTime) && isNaN(faultEndTime)) || wasFaultStopped ? 'expired' : 'time'}
                  iconProps={{ size: 12 }}
                  durationText=" "
                  color={Color.GREY_800}
                  font={{ size: 'small', weight: 'semi-bold' }}
                />
              </Layout.Horizontal>
            </Layout.Horizontal>
          </Container>
          <Container padding={{ top: 'xsmall', bottom: 'small' }}>
            <Layout.Horizontal spacing={'medium'} flex={{ justifyContent: 'flex-start', alignItems: 'baseline' }}>
              <Text width={100} font={{ variation: FontVariation.BODY2 }} color={Color.GREY_500}>
                {getString('namespace')}:
              </Text>
              <Layout.Horizontal spacing={'small'}>
                <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_800} lineClamp={1}>
                  {namespace}
                </Text>
              </Layout.Horizontal>
            </Layout.Horizontal>
          </Container>
        </div>
        {/* <!-- Error -->*/}
        {faultVerdict && (
          <Container
            padding={{ left: 'medium', right: 'medium', top: 'small', bottom: 'small' }}
            style={{ backgroundColor: Utils.getRealCSSColor(Color.RED_50) }}
          >
            <Layout.Horizontal
              flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}
              spacing={'small'}
              margin={{ bottom: 'small' }}
            >
              <Text font={{ size: 'normal', weight: 'semi-bold' }} color={Color.RED_800}>
                {getString('faultSummary')}:
              </Text>
              <Text
                margin={{ left: '0.25rem' }}
                font={{ mono: true, size: 'small', weight: 'semi-bold' }}
                lineClamp={1}
              >
                {faultVerdict.errorCode}
              </Text>
            </Layout.Horizontal>
            <Text font={{ mono: true, size: 'xsmall' }} lineClamp={4} style={{ lineHeight: '18px' }}>
              {(faultVerdict as FailureOutput).failedStep || (faultVerdict as ErrorOutput).reason}
            </Text>
          </Container>
        )}
        {/* <!-- Tabs -->*/}
        <DetailsTabs
          node={node}
          manifest={manifest}
          podID={podID}
          probeData={probeData}
          experimentRunID={experimentRunID}
          infraID={infraID}
          loading={loading}
          phase={phase}
          namespace={namespace}
        />
      </Layout.Vertical>
    </Container>
  ) : (
    <></>
  );
};

export default ExperimentRunDetailsPanel;
