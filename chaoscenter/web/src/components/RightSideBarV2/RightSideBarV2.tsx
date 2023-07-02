import React from 'react';
import { Container, Layout, Text } from '@harness/uicore';
import { Color, FontVariation } from '@harness/design-system';
import { Classes } from '@blueprintjs/core';
import { useStrings } from '@strings';
import {
  CloneExperimentButton,
  DownloadExperimentButton,
  EditExperimentButton,
  RunExperimentButton
} from '@components/ExperimentActionButtons';
import type { RefetchExperimentRuns, RefetchExperiments } from '@controllers/ExperimentDashboardV2';
import { ExperimentRunStatus, ExperimentType, InfrastructureType } from '@api/entities';
import { useSearchParams } from '@hooks';

interface RightSideBarViewV2Props extends Partial<RefetchExperiments>, Partial<RefetchExperimentRuns> {
  experimentID: string;
  experimentRunID?: string;
  infrastructureType?: InfrastructureType;
  experimentType?: ExperimentType;
  phase: ExperimentRunStatus | undefined;
  loading?: boolean;
  isEditMode?: boolean;
}

function RightSideBarV2({
  experimentID,
  experimentType,
  phase,
  loading,
  isEditMode,
  refetchExperiments
}: RightSideBarViewV2Props): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();

  const internalExperimentType = (searchParams.get('experimentType') as ExperimentType | undefined) ?? experimentType;

  return (
    <Layout.Vertical
      height={'100%'}
      padding={{ top: 'large', bottom: 'large' }}
      flex={{ justifyContent: 'flex-start', alignItems: 'center' }}
      spacing={'xlarge'}
      className={loading ? Classes.SKELETON : ''}
    >
      {internalExperimentType === ExperimentType.NON_CRON && (
        <Container>
          <Layout.Vertical flex={{ justifyContent: 'center' }} spacing={'small'}>
            <RunExperimentButton
              tooltipProps={{ disabled: phase === ExperimentRunStatus.RUNNING }}
              experimentID={experimentID}
              refetchExperiments={refetchExperiments}
              buttonProps={{
                disabled: phase === ExperimentRunStatus.QUEUED || phase === ExperimentRunStatus.RUNNING
              }}
            />
            <Text style={{ textAlign: 'center' }} color={Color.GREY_500} font={{ variation: FontVariation.TINY_SEMI }}>
              {getString('run')}
            </Text>
          </Layout.Vertical>
        </Container>
      )}

      {/* <!-- divider --> */}
      {internalExperimentType === ExperimentType.NON_CRON && (
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

      {/* <!-- clone experiment button --> */}
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
