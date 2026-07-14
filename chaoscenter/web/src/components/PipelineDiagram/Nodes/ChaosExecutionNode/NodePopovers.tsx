import React from 'react';
import { Text, Container, Layout } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { Icon } from '@harnessio/icons';
import type { ChaosResult } from '@models';
import { useStrings } from '@strings';
import ProbePassedFailedCount from '@components/ProbePassedFailedCount';
import { ExperimentRunFaultStatus, FaultProbeStatus } from '@api/entities';
import { phaseToUI } from '@utils';
import { getChaosStatusProps } from '../utils';
import css from './ChaosExecutionNode.module.scss';

export interface ToolTipData {
  nodeName: string;
  stepStatus: ExperimentRunFaultStatus;
  chaosResult: ChaosResult | undefined;
}

export const RenderNotStartedPopover = ({ nodeName }: ToolTipData): JSX.Element => {
  const { getString } = useStrings();

  return (
    <Container padding="medium">
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.BODY1 }} color={Color.WHITE} style={{ marginRight: 12 }}>
          {nodeName}
        </Text>
        <Layout.Horizontal spacing={'small'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.WHITE}>
            {getString('executionStatus')}:
          </Text>
          <Container flex={{ justifyContent: 'flex-start' }}>
            <Icon
              name="execution-waiting"
              style={{ color: `var(--orange-700)` }}
              size={18}
              margin={{ right: 'xsmall' }}
            />
            <Text font={{ variation: FontVariation.H6 }} color={Color.WHITE}>
              {getString('notStarted')}
            </Text>
          </Container>
        </Layout.Horizontal>
      </Layout.Vertical>
    </Container>
  );
};

export const RenderPopover = ({ nodeName, stepStatus, chaosResult }: ToolTipData): JSX.Element => {
  const { getString } = useStrings();

  const { secondaryIconProps, secondaryIcon, secondaryIconStyle } = getChaosStatusProps(stepStatus);

  let probePassed = 0;
  let probeFailed = 0;

  chaosResult?.status?.probeStatuses?.map(probe => {
    if (probe?.status?.verdict === FaultProbeStatus.PASSED) probePassed++;
    if (probe?.status?.verdict === FaultProbeStatus.FAILED) probeFailed++;
  });

  return (
    <Container padding="medium">
      <Layout.Vertical>
        <Text font={{ variation: FontVariation.BODY1 }} color={Color.WHITE} style={{ marginRight: 12 }}>
          {nodeName}
        </Text>
        <Layout.Horizontal spacing={'small'} flex={{ justifyContent: 'flex-start', alignItems: 'center' }}>
          <Text font={{ variation: FontVariation.SMALL }} color={Color.WHITE}>
            {getString('executionStatus')}:
          </Text>
          <Container flex={{ justifyContent: 'flex-start' }}>
            {secondaryIcon && (
              <Icon
                name={secondaryIcon}
                style={secondaryIconStyle}
                size={13}
                {...secondaryIconProps}
                margin={{ right: 'xsmall' }}
              />
            )}
            <Text font={{ variation: FontVariation.H6 }} color={Color.WHITE}>
              {phaseToUI(stepStatus)}
            </Text>
          </Container>
        </Layout.Horizontal>
      </Layout.Vertical>
      {nodeName !== 'install-chaos-faults' && nodeName !== 'cleanup-chaos-resources' && (
        <Container>
          <hr className={css.divider} />
          <Text font={{ variation: FontVariation.BODY2 }} color={Color.WHITE}>
            {getString('probeResult')}
          </Text>
          <ProbePassedFailedCount
            flexStart={false}
            phase={stepStatus}
            passedCount={probePassed}
            failedCount={probeFailed}
            textColorInverse
          />
        </Container>
      )}
    </Container>
  );
};
