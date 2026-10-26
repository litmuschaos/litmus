import React from 'react';
import { useParams } from 'react-router-dom';
import { Container, Layout, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import { parse } from 'yaml';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import type { PredefinedExperiment } from '@api/entities';
import { capitalize, getScope } from '@utils';
import PredefinedExperimentCard from '@components/PredefinedExperimentCard';
import { useStrings } from '@strings';
import Loader from '@components/Loader';
import { useSearchParams, useRouteWithBaseUrl } from '@hooks';
import { GenericErrorHandler } from '@errors';
import type { FaultDetails } from '@api/core';
import css from './ChaosFault.module.scss';

interface ChaosFaultViewProps {
  faultDetails: FaultDetails | undefined;
  chartName: string;
  loading: {
    getHubFaults: boolean;
    getHubExperiment: boolean;
  };
  experiments: Array<PredefinedExperiment>;
}

export default function ChaosFaultView({
  faultDetails,
  chartName,
  loading,
  experiments
}: ChaosFaultViewProps): React.ReactElement {
  const scope = getScope();
  const { getString } = useStrings();
  const paths = useRouteWithBaseUrl();
  const { hubID } = useParams<{ hubID: string }>();
  const { faultName } = useParams<{ faultName: string }>();
  const searchParams = useSearchParams();
  const hubName = searchParams.get('hubName');
  const isDefault = searchParams.get('isDefault');
  const faultCSV = parse(faultDetails?.csv ?? '');
  const breadcrumbs = [
    {
      label: getString('chaoshubs'),
      url: paths.toChaosHubs()
    },
    {
      label: `${hubName}`,
      url: paths.toChaosHub({ hubID }) + `?hubName=${hubName}&isDefault=${isDefault}`
    }
  ];

  const title = (
    <Text font={{ variation: FontVariation.H4 }} color={Color.GREY_700}>
      {faultCSV?.spec.displayName ?? <Icon name="steps-spinner" size={22} color={Color.GREY_800} />}
    </Text>
  );

  if (!loading.getHubExperiment && !loading.getHubFaults && faultDetails === undefined) {
    return (
      <GenericErrorHandler
        errStatusCode={400}
        errorMessage={getString('genericResourceNotFoundError', {
          resource: getString('chaosHubFault'),
          resourceID: faultName,
          projectID: scope.projectID
        })}
      />
    );
  }

  return (
    // TODO: Update category
    <DefaultLayoutTemplate
      title={title}
      breadcrumbs={breadcrumbs}
      subTitle={capitalize(chartName)}
      noPadding
      loading={loading.getHubFaults}
    >
      <Layout.Horizontal
        padding={{ top: 'medium', right: 'xlarge', bottom: 'medium', left: 'xlarge' }}
        className={css.fullHeight}
        spacing="xlarge"
      >
        <Container
          width="50%"
          height="fit-content"
          background={Color.WHITE}
          className={css.card}
          padding={{ top: 'large', bottom: 'small', left: 'xlarge', right: 'xlarge' }}
        >
          <Text font={{ variation: FontVariation.H6 }}>{getString('overview')}</Text>
          <Container className={css.container} border={{ bottom: true }}>
            <Text font={{ variation: FontVariation.BODY }}>{getString('platform')}</Text>
            <Text className={css.container} font={{ variation: FontVariation.BODY }} color={Color.GREY_450}>
              {faultCSV?.spec.platforms.map((platform: any) => platform).join(', ')}
            </Text>
          </Container>
          <Container className={css.container}>
            <Text font={{ variation: FontVariation.BODY }} margin={{ top: 'xsmall' }}>
              {getString('description')}
            </Text>
            <Text font={{ variation: FontVariation.BODY }} color={Color.GREY_450} className={css.container}>
              {faultCSV?.spec.categoryDescription}
            </Text>
          </Container>
        </Container>
        <Container width="50%" height="fit-content" background={Color.WHITE} className={css.card} padding="medium">
          <Text font={{ variation: FontVariation.H6 }}>{getString('experimentInFault')}</Text>
          <Container margin={{ top: 'medium' }}>
            <Loader
              testId="experiment-loader"
              noData={{
                when: () => experiments.length === 0,
                messageTitle: getString('noData.title'),
                message: getString('noExpFound')
              }}
              loading={loading.getHubExperiment}
              height={loading.getHubExperiment ? 230 : '100%'}
              small
            >
              <Layout.Vertical spacing="medium">
                {experiments.map(experiment => {
                  return (
                    <Container key={experiment.experimentName}>
                      <PredefinedExperimentCard predefinedExperiment={experiment} />
                    </Container>
                  );
                })}
              </Layout.Vertical>
            </Loader>
          </Container>
        </Container>
      </Layout.Horizontal>
    </DefaultLayoutTemplate>
  );
}
