import React from 'react';
import { Layout, Text } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { useStrings } from '@strings';
import { ExperimentRunFaultStatus } from '@api/entities';
import { ProbeFailedIcon, ProbePassedIcon } from './ProbeIcons';

interface PassedFailedCountProps {
  passedCount: number;
  failedCount: number;
  textColorInverse?: boolean;
  phase: ExperimentRunFaultStatus;
  flexStart?: boolean;
}

export default function ProbePassedFailedCount({
  passedCount,
  failedCount,
  textColorInverse,
  phase,
  flexStart
}: PassedFailedCountProps): React.ReactElement {
  const { getString } = useStrings();

  return (
    <Layout.Horizontal
      flex={{ justifyContent: flexStart ? 'flex-start' : 'space-between' }}
      style={{ padding: flexStart ? '10px 0' : '8px 0 0 0', gap: flexStart ? '1rem' : '2rem' }}
    >
      <Layout.Horizontal flex style={{ gap: '0.5rem' }}>
        <Layout.Horizontal spacing={'xsmall'}>
          {phase && <ProbePassedIcon phase={phase} />}
          <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.GREEN_600}>
            {phase && phase === ExperimentRunFaultStatus.RUNNING ? '--' : passedCount}
          </Text>
        </Layout.Horizontal>
        <Text font={{ size: 'small' }} color={textColorInverse ? Color.WHITE : Color.GREY_600}>
          {getString('passed')}
        </Text>
      </Layout.Horizontal>
      <Layout.Horizontal flex style={{ gap: '0.5rem' }}>
        <Layout.Horizontal spacing={'xsmall'}>
          {phase && <ProbeFailedIcon phase={phase} />}
          <Text font={{ size: 'medium', weight: 'semi-bold' }} color={Color.RED_600}>
            {phase && phase === ExperimentRunFaultStatus.RUNNING ? '--' : failedCount}
          </Text>
        </Layout.Horizontal>
        <Text font={{ size: 'small' }} color={textColorInverse ? Color.WHITE : Color.GREY_600}>
          {getString('failed')}
        </Text>
      </Layout.Horizontal>
    </Layout.Horizontal>
  );
}
