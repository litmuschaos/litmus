import React from 'react';
import { parse } from 'yaml';
import { Container, Layout, NestedAccordionPanel, NestedAccordionProvider, Text } from '@harness/uicore';
import { Color, FontVariation } from '@harness/design-system';
import { withErrorBoundary } from 'react-error-boundary';
import cx from 'classnames';
import { useStrings } from '@strings';
import { Fallback } from '@errors';
import type { ProbeStatuses, ExperimentManifest, ProbeAttributes } from '@models';
import Loader from '@components/Loader';
import ProbeInformationCard, { ProbeInformationType } from '@components/ProbeInformationCard';
import StatusBadgeV2, { StatusBadgeEntity } from '@components/StatusBadgeV2';
import experimentYamlService from 'services/experiment';
import { FaultProbeStatus } from '@api/entities';
import css from '../ExperimentRunDetailsPanel.module.scss';

interface ProbesTabProps {
  loading?: boolean;
  manifest?: string;
  nodeName: string;
  probeStatuses: ProbeStatuses[] | undefined;
}

interface ProbeCardProps {
  probe: ProbeAttributes;
  probeStatus: ProbeStatuses | undefined;
}

function ProbeCard({ probe, probeStatus }: ProbeCardProps): React.ReactElement {
  const { getString } = useStrings();
  return (
    <div className={css.probeBox}>
      <NestedAccordionProvider>
        <NestedAccordionPanel
          id={`${probe.name}-header`}
          // heading
          summary={
            <Container>
              <Layout.Horizontal width="100%" flex margin={{ top: 'small', bottom: 'small' }}>
                <Text font={{ variation: FontVariation.H5, weight: 'light' }} lineClamp={1} style={{ maxWidth: 160 }}>
                  {probe.name}
                </Text>
                <Layout.Vertical className={css.probeType}>
                  <Layout.Horizontal spacing={'xsmall'} flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}>
                    <Text width={38} color={Color.GREY_600} font={{ variation: FontVariation.FORM_LABEL }}>
                      {getString('type')}{' '}
                    </Text>
                    <Text font={{ variation: FontVariation.SMALL }}>{probe.type}</Text>
                  </Layout.Horizontal>
                  <Layout.Horizontal spacing={'xsmall'} flex={{ alignItems: 'baseline', justifyContent: 'flex-start' }}>
                    <Text width={38} color={Color.GREY_600} font={{ variation: FontVariation.FORM_HELP }}>
                      {getString('mode')}{' '}
                    </Text>
                    <Text font={{ variation: FontVariation.SMALL }}>{probe.mode}</Text>
                  </Layout.Horizontal>
                </Layout.Vertical>
                {probeStatus !== undefined && (
                  <div className={css.badge}>
                    <StatusBadgeV2
                      status={probeStatus?.status?.verdict as FaultProbeStatus}
                      entity={StatusBadgeEntity.Probe}
                    />
                  </div>
                )}
              </Layout.Horizontal>
            </Container>
          }
          // expanding body
          details={
            <Container
              className={cx(
                { [css.successBox]: probeStatus?.status?.verdict === FaultProbeStatus.PASSED },
                { [css.errorBox]: probeStatus?.status?.verdict === FaultProbeStatus.FAILED }
              )}
            >
              {probeStatus?.status?.verdict === FaultProbeStatus.AWAITED ? (
                <Text font={{ size: 'small' }}>{getString('resultAfterExecution')}</Text>
              ) : (
                <div className={css.boxPadding}>
                  {probeStatus?.status?.verdict !== FaultProbeStatus['N/A'] && (
                    <div>
                      <div className={css.boxHeading}>{getString('probeSummary')}</div>
                      <Text font={{ size: 'small' }} padding={{ top: 'small' }}>
                        {probeStatus?.status?.description ?? getString('probeResultNotAvailable')}
                      </Text>
                    </div>
                  )}
                </div>
              )}
            </Container>
          }
        />
        <NestedAccordionPanel
          panelClassName={css.subPanel}
          summaryClassName={css.subPanelSummary}
          chevronClassName={css.chevron}
          details={<ProbeInformationCard display={ProbeInformationType.DETAILS} probe={probe} isVerbose={false} />}
          id={`${probe.name}-details`}
          summary={getString('viewProbeDetails')}
        />
        <NestedAccordionPanel
          panelClassName={css.subPanel}
          summaryClassName={css.subPanelSummary}
          chevronClassName={css.chevron}
          details={<ProbeInformationCard display={ProbeInformationType.PROPERTIES} probe={probe} isVerbose={false} />}
          id={`${probe.name}-properties`}
          summary={getString('viewProbeProperties')}
        />
      </NestedAccordionProvider>
    </div>
  );
}

function ProbesTab({ loading, manifest, nodeName, probeStatuses }: ProbesTabProps): React.ReactElement {
  const { getString } = useStrings();
  const parsedManifest = manifest ? (parse(manifest) as ExperimentManifest) : undefined;
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler();
  const probes = experimentHandler?.extractProbeDetails(parsedManifest, nodeName);

  return (
    <Container padding="medium">
      <Loader loading={loading} small>
        {probes ? (
          <Layout.Vertical className={css.probeTab} spacing={'small'}>
            {probes?.map((probe, index) => (
              <ProbeCard key={probe.name} probe={probe} probeStatus={probeStatuses?.[index]} />
            ))}
          </Layout.Vertical>
        ) : (
          <Container className={css.probeTab} margin={{ top: 'small' }}>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {getString('noProbesAvailable')}
            </Text>
          </Container>
        )}
      </Loader>
    </Container>
  );
}

export default withErrorBoundary(ProbesTab, { FallbackComponent: Fallback });
