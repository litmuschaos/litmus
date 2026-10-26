import React from 'react';
import { parse } from 'yaml';
import { Container, Layout, NestedAccordionPanel, NestedAccordionProvider, Text } from '@harnessio/uicore';
import { Color, FontVariation } from '@harnessio/design-system';
import { withErrorBoundary } from 'react-error-boundary';
import cx from 'classnames';
import { useStrings } from '@strings';
import { Fallback } from '@errors';
import type { ProbeStatuses, ExperimentManifest, ProbeAttributes, KubernetesExperimentManifest } from '@models';
import Loader from '@components/Loader';
import StatusBadgeV2, { StatusBadgeEntity } from '@components/StatusBadgeV2';
import experimentYamlService, { KubernetesYamlService } from 'services/experiment';
import { FaultProbeStatus, InfrastructureType, Mode, Probe, Status } from '@api/entities';
import type { ProbeInRuns } from '@api/core';
import { getInfrastructureTypeFromExperimentKind } from '@utils';
import ProbeInformationCardFromAPI from '@components/ProbeInformationCard/ProbeInformationCardFromAPI';
import ProbeInformationCard, { ProbeInformationType } from '@components/ProbeInformationCard';
import css from '../ExperimentRunDetailsPanel.module.scss';

interface ProbesTabProps {
  loading?: boolean;
  manifest?: string;
  probeData: ProbeInRuns[] | undefined;
  nodeName: string;
  probeStatuses: ProbeStatuses[] | undefined;
}

interface ProbeCardFromManifestProps {
  probe: ProbeAttributes;
  probeStatus: ProbeStatuses | undefined;
}

interface ProbeCardFromAPIProps {
  probe: Probe;
  mode: Mode;
  probeStatus: ProbeStatuses | Status | undefined;
}

function ProbeCardFromManifest({ probe, probeStatus }: ProbeCardFromManifestProps): React.ReactElement {
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
                <div className={css.badge}>
                  <StatusBadgeV2
                    status={
                      probeStatus?.status?.verdict
                        ? (probeStatus.status.verdict as FaultProbeStatus)
                        : FaultProbeStatus.NA
                    }
                    entity={StatusBadgeEntity.Probe}
                  />
                </div>
              </Layout.Horizontal>
            </Container>
          }
          // expanding body
          details={
            <Container
              className={cx(
                { [css.successBox]: probeStatus?.status?.verdict === FaultProbeStatus.PASSED },
                { [css.errorBox]: probeStatus?.status?.verdict === FaultProbeStatus.FAILED },
                { [css.naBox]: probeStatus?.status?.verdict === FaultProbeStatus['N/A'] }
              )}
            >
              {probeStatus?.status?.verdict === FaultProbeStatus.AWAITED ? (
                <Text font={{ size: 'small' }}>{getString('resultAfterExecution')}</Text>
              ) : (
                <div className={css.boxPadding}>
                  <div className={css.boxHeading}>{getString('probeSummary')}</div>
                  <Text font={{ size: 'small' }} padding={{ top: 'small' }}>
                    {probeStatus?.status?.description ?? getString('probeResultNotAvailable')}
                  </Text>
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

function ProbeCardFromAPI({ probe, mode, probeStatus }: ProbeCardFromAPIProps): React.ReactElement {
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
                    <Text font={{ variation: FontVariation.SMALL }}>{mode}</Text>
                  </Layout.Horizontal>
                </Layout.Vertical>
                {probeStatus && (
                  <div className={css.badge}>
                    <StatusBadgeV2
                      status={(probeStatus as Status).verdict as FaultProbeStatus}
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
                {
                  [css.successBox]: (probeStatus as Status)?.verdict === FaultProbeStatus.PASSED
                },
                {
                  [css.errorBox]: (probeStatus as Status)?.verdict === FaultProbeStatus.FAILED
                },
                { [css.naBox]: (probeStatus as Status).verdict === FaultProbeStatus['N/A'] }
              )}
            >
              {(probeStatus as Status)?.verdict === FaultProbeStatus.AWAITED ? (
                <Text font={{ size: 'small' }}>{getString('resultAfterExecution')}</Text>
              ) : (
                <div className={css.boxPadding}>
                  <div className={css.boxHeading}>{getString('probeSummary')}</div>
                  <Text font={{ size: 'small' }} padding={{ top: 'small' }}>
                    {(probeStatus as Status)?.description ?? getString('probeResultNotAvailable')}
                  </Text>
                </div>
              )}
            </Container>
          }
        />
        <NestedAccordionPanel
          panelClassName={css.subPanel}
          summaryClassName={css.subPanelSummary}
          chevronClassName={css.chevron}
          details={
            <ProbeInformationCardFromAPI display={ProbeInformationType.DETAILS} probe={probe} isVerbose={false} />
          }
          id={`${probe.name}-details`}
          summary={getString('viewProbeDetails')}
        />
        <NestedAccordionPanel
          panelClassName={css.subPanel}
          summaryClassName={css.subPanelSummary}
          chevronClassName={css.chevron}
          details={
            <ProbeInformationCardFromAPI display={ProbeInformationType.PROPERTIES} probe={probe} isVerbose={false} />
          }
          id={`${probe.name}-properties`}
          summary={getString('viewProbeProperties')}
        />
      </NestedAccordionProvider>
    </div>
  );
}

function ProbesTab({ loading, manifest, nodeName, probeData, probeStatuses }: ProbesTabProps): React.ReactElement {
  const { getString } = useStrings();
  const parsedManifest = manifest ? (parse(manifest) as ExperimentManifest) : undefined;
  const infrastructureType = getInfrastructureTypeFromExperimentKind(parsedManifest);
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);

  // Backward compatibility for deprecated probes
  let deprecatedProbes: ProbeAttributes[] | undefined;
  if (infrastructureType === InfrastructureType.KUBERNETES) {
    deprecatedProbes = (experimentHandler as KubernetesYamlService)?.extractDeprecatedProbeDetails(
      parsedManifest as KubernetesExperimentManifest,
      nodeName
    );
  }

  return (
    <Container padding="medium">
      <Loader loading={loading} small>
        {!deprecatedProbes && (!probeData || probeData.length === 0) ? (
          <Container className={css.probeTab} margin={{ top: 'small' }}>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_600}>
              {getString('noProbesAvailable')}
            </Text>
          </Container>
        ) : (
          <Layout.Vertical className={css.probeTab} spacing={'small'}>
            <>
              {deprecatedProbes?.map((probe, index) => (
                <ProbeCardFromManifest key={probe.name} probe={probe} probeStatus={probeStatuses?.[index]} />
              ))}
              {probeData?.map(data => (
                <ProbeCardFromAPI key={data.probe.name} probe={data.probe} mode={data.mode} probeStatus={data.status} />
              ))}
            </>
          </Layout.Vertical>
        )}
      </Loader>
    </Container>
  );
}

export default withErrorBoundary(ProbesTab, { FallbackComponent: Fallback });
