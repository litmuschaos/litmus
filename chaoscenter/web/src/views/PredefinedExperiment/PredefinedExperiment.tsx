import React from 'react';
import { useParams } from 'react-router-dom';
import { ButtonSize, ButtonVariation, Card, CardBody, Container, Layout, Text } from '@harnessio/uicore';
import { Icon } from '@harnessio/icons';
import { Color, FontVariation } from '@harnessio/design-system';
import { parse } from 'yaml';
import VisualizeExperimentManifestView from '@views/VisualizeExperimentManifest';
import DefaultLayoutTemplate from '@components/DefaultLayout';
import type { FaultList, PredefinedExperiment } from '@api/entities';
import { useSearchParams, useRouteWithBaseUrl } from '@hooks';
import { ExperimentManifest, PermissionGroup } from '@models';
import { getScope } from '@utils';
import { useStrings } from '@strings';
import ReadMore from '@components/ReadMore';
import { ParentComponentErrorWrapper, GenericErrorHandler } from '@errors';
import { useLaunchExperimentFromHub } from 'hooks/useLaunchExperimentFromHub';
import RbacButton from '@components/RbacButton';
import css from './PredefinedExperiment.module.scss';

interface PredefinedExperimentProps {
  predefinedExperimentDetails: PredefinedExperiment | undefined;
  chartName: string;
  loading: {
    listPredefinedExperiment: boolean;
  };
}

export default function PredefinedExperimentView({
  predefinedExperimentDetails,
  loading
}: PredefinedExperimentProps): React.ReactElement {
  const scope = getScope();
  const paths = useRouteWithBaseUrl();
  const { hubID } = useParams<{ hubID: string }>();
  const { experimentName } = useParams<{ experimentName: string }>();
  const searchParams = useSearchParams();
  const hubName = searchParams.get('hubName');
  const isDefault = searchParams.get('isDefault');
  const parsedCSV = parse(predefinedExperimentDetails?.experimentCSV || '');
  const parsedManifest = parse(predefinedExperimentDetails?.experimentManifest || '') as ExperimentManifest;
  const { getString } = useStrings();
  const launchExperiment = useLaunchExperimentFromHub(predefinedExperimentDetails);

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
      {parsedCSV?.spec.displayName ?? <Icon name="steps-spinner" size={22} color={Color.GREY_800} />}
    </Text>
  );

  const toolbar = (
    <ParentComponentErrorWrapper>
      <RbacButton
        icon="run-pipeline"
        variation={ButtonVariation.PRIMARY}
        text={getString('launchExperiment')}
        intent="success"
        disabled={predefinedExperimentDetails === undefined || loading.listPredefinedExperiment ? true : false}
        size={ButtonSize.MEDIUM}
        permission={PermissionGroup.EDITOR}
        onClick={launchExperiment}
      />
    </ParentComponentErrorWrapper>
  );

  if (!loading.listPredefinedExperiment && predefinedExperimentDetails === undefined) {
    return (
      <GenericErrorHandler
        errStatusCode={400}
        errorMessage={getString('genericResourceNotFoundError', {
          resource: getString('chaosHubExperiment'),
          resourceID: experimentName,
          projectID: scope.projectID
        })}
      />
    );
  }

  return (
    <DefaultLayoutTemplate
      title={title}
      breadcrumbs={breadcrumbs}
      headerToolbar={toolbar}
      subTitle={parsedCSV?.spec?.keywords.map((keyword: string) => keyword).join(', ') ?? getString('na')}
      noPadding
      loading={loading.listPredefinedExperiment}
    >
      <Layout.Vertical
        padding={{ top: 'medium', right: 'xlarge', bottom: 'medium', left: 'xlarge' }}
        className={css.fullHeight}
        spacing="xlarge"
      >
        <Container background={Color.WHITE} className={css.card}>
          <Text className={css.title} font={{ variation: FontVariation.H6 }}>
            {getString('description')}
          </Text>
          <Text
            className={css.subtitle}
            font={{ variation: FontVariation.BODY }}
            margin={{ top: 'xsmall' }}
            color={Color.GREY_450}
          >
            {parsedCSV?.spec?.categoryDescription}
          </Text>
        </Container>
        <Container padding="medium" background={Color.WHITE} className={css.card}>
          <Text className={css.title} font={{ variation: FontVariation.H6 }}>
            {getString('preview')}
          </Text>
          <div className={css.previewContainer}>
            <VisualizeExperimentManifestView manifest={parsedManifest} initialZoomLevel={0.75} />
          </div>
        </Container>
        <Container padding="medium" background={Color.WHITE} className={css.card}>
          <Text className={css.title} font={{ variation: FontVariation.H6 }}>
            {getString('fault')}({parsedCSV?.spec?.faults?.length})
          </Text>
          <Layout.Horizontal spacing="small" margin={{ top: 'small' }} className={css.faultCard}>
            {parsedCSV?.spec?.faults?.map((experiment: FaultList) => (
              <Layout.Horizontal key={experiment.name}>
                <Card className={css.faultIcon}>
                  <CardBody.Icon icon="chaos-scenario-builder" iconSize={35} />
                </Card>
                <div
                  className={css.faultDetails}
                  style={{ alignSelf: experiment.description === '' ? 'center' : 'flex-start' }}
                >
                  <Text font={{ size: 'normal', weight: 'bold' }} color={Color.GREY_900}>
                    {experiment.name}
                  </Text>

                  <Text font={{ size: 'small' }} className={css.desc} color={Color.GREY_900}>
                    <ReadMore trimLength={85} text={experiment.description} />
                  </Text>
                </div>
              </Layout.Horizontal>
            ))}
          </Layout.Horizontal>
        </Container>
        <Container padding="medium" background={Color.WHITE} className={css.card}>
          <Text className={css.title} font={{ variation: FontVariation.H6 }}>
            {getString('howToUseExp')}
          </Text>
          <Text
            className={css.subtitle}
            font={{ variation: FontVariation.BODY }}
            margin={{ top: 'xsmall' }}
            color={Color.GREY_450}
          >
            {getString('chaosHubStep1')}
          </Text>
          <Text className={css.subtitle} font={{ variation: FontVariation.BODY }} color={Color.GREY_450}>
            {getString('chaosHubStep2')}
          </Text>
          <Text className={css.subtitle} font={{ variation: FontVariation.BODY }} color={Color.GREY_450}>
            {getString('chaosHubStep3')}
          </Text>
          <ParentComponentErrorWrapper>
            <RbacButton
              text={getString('launchExperiment')}
              intent="primary"
              variation={ButtonVariation.PRIMARY}
              size={ButtonSize.MEDIUM}
              margin={{ top: 'medium' }}
              permission={PermissionGroup.EDITOR}
              onClick={launchExperiment}
            />
          </ParentComponentErrorWrapper>
        </Container>
      </Layout.Vertical>
    </DefaultLayoutTemplate>
  );
}
