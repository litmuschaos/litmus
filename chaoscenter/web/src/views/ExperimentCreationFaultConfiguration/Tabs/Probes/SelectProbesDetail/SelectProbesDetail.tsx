import React from 'react';
import { withErrorBoundary } from 'react-error-boundary';
import { Layout, Text, ButtonVariation, Button } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import probeFallback from '@images/ProbeFallback.svg';
import { Fallback } from '@errors';
import Loader from '@components/Loader';
import { useStrings } from '@strings';
import { getScope } from '@utils';
import type { Probe } from '@api/entities';
import type { SelectProbesDetailControllerProps } from '@controllers/SelectProbesDetail/SelectProbesDetail';
import type { GetLazyProbe } from '@models';
import ProbeDescription from './ProbeDescription';
import css from './SelectProbeDetails.module.scss';

export interface SelectProbesDetailViewProps extends GetLazyProbe, SelectProbesDetailControllerProps {
  loading: boolean;
}

function SelectProbesDetailView({
  loading,
  probe,
  setIsAddProbeSelected,
  setIsModeSelected,
  getLazyProbeQuery,
  isModeSelected
}: SelectProbesDetailViewProps): React.ReactElement {
  const scope = getScope();
  const { getString } = useStrings();
  const [probeDetail, setProbeDetail] = React.useState<Probe>();

  React.useEffect(() => {
    if (probe?.probeName) {
      getLazyProbeQuery({
        variables: {
          projectID: scope.projectID,
          probeName: probe.probeName
        }
      }).then(getProbe => {
        if (getProbe.data) setProbeDetail(getProbe.data.getProbe);
      });
    }
  }, [probe]);

  return (
    <Loader
      loading={loading}
      height="fit-content"
      style={{
        minHeight: loading ? 'calc(var(--page-min-height) - var(--spacing-xxlarge))' : 'initial'
      }}
    >
      {probe ? (
        <Layout.Horizontal
          padding={{ top: 'large', left: 'medium', right: 'medium', bottom: 'large' }}
          flex={{ alignItems: 'center', justifyContent: 'space-between' }}
          style={{ gap: '1rem' }}
        >
          <Layout.Vertical style={{ flexGrow: 1 }}>
            <Text lineClamp={1} width={150} font={{ variation: FontVariation.H5, weight: 'bold' }} color={Color.WHITE}>
              {probe.probeName}
            </Text>
            <Text
              lineClamp={1}
              width={150}
              font={{ variation: FontVariation.TINY_SEMI, weight: 'light' }}
              margin={{ top: 'xsmall' }}
              color={Color.WHITE}
            >
              {`${getString('id')}: ${probe.probeName}`}
            </Text>
          </Layout.Vertical>
          {probe?.probeName && (
            <Button
              variation={ButtonVariation.PRIMARY}
              text={getString('addToFault')}
              onClick={() => {
                setIsAddProbeSelected(false);
                setIsModeSelected(true);
              }}
            />
          )}
        </Layout.Horizontal>
      ) : (
        <Layout.Vertical
          padding={{ left: 'large', right: 'large' }}
          height={'calc(var(--page-min-height) - var(--spacing-xxlarge))'}
          flex={{ justifyContent: 'center' }}
        >
          <img src={probeFallback} alt={getString('addOrClick')} />
          <Text font={{ variation: FontVariation.SMALL_SEMI }} flex color={Color.WHITE} className={css.title}>
            {getString('addOrClick')}
          </Text>
        </Layout.Vertical>
      )}

      {probeDetail && <ProbeDescription probeDetail={probeDetail} isModeSelected={isModeSelected} />}
    </Loader>
  );
}

export default withErrorBoundary(SelectProbesDetailView, { FallbackComponent: Fallback });
