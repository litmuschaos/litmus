import { Card } from '@blueprintjs/core';
import { Color, FontVariation } from '@harnessio/design-system';
import { Text, ButtonVariation, Layout } from '@harnessio/uicore';
import React from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { withErrorBoundary } from 'react-error-boundary';
import { parse } from 'yaml';
import type { Chart, PredefinedExperiment } from '@api/entities';
import { useStrings } from '@strings';
import { useSearchParams, useRouteWithBaseUrl } from '@hooks';
import ReadMore from '@components/ReadMore';
import { Fallback, ParentComponentErrorWrapper } from '@errors';
import { useLaunchExperimentFromHub } from 'hooks/useLaunchExperimentFromHub';
import { PermissionGroup } from '@models';
import RbacButton from '@components/RbacButton';
import css from './PredefinedExperimentCard.module.scss';

interface PredefinedExperimentCardProps {
  predefinedExperiment: PredefinedExperiment | undefined;
}

function PredefinedExperimentCard({ predefinedExperiment }: PredefinedExperimentCardProps): React.ReactElement {
  // const scope = getScope();
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const { hubID } = useParams<{ hubID: string }>();
  const hubName = searchParams.get('hubName');
  const isDefault = searchParams.get('isDefault');
  const history = useHistory();
  const paths = useRouteWithBaseUrl();
  const launchExperiment = useLaunchExperimentFromHub(predefinedExperiment);
  const chart = parse(predefinedExperiment?.experimentCSV ?? '') as Chart;

  return (
    <Card key={chart.metadata.name} className={css.predefinedExperimentCard}>
      <Layout.Horizontal flex>
        <Layout.Vertical data-testid="details" spacing="xsmall" width="60%" style={{ cursor: 'pointer' }}>
          <Text
            font={{ variation: FontVariation.BODY, weight: 'semi-bold' }}
            color={Color.PRIMARY_7}
            onClick={() =>
              history.push({
                pathname: paths.toPredefinedExperiment({
                  hubID: hubID as string,
                  experimentName: predefinedExperiment?.experimentName ?? ''
                }),
                search: `?hubName=${hubName}&isDefault=${isDefault}&chartName=predefined`
              })
            }
          >
            {chart.spec.displayName}
          </Text>
          <Text className={css.desc} font={{ variation: FontVariation.SMALL }} color={Color.GREY_450}>
            <ReadMore text={chart.spec.categoryDescription} />
          </Text>
        </Layout.Vertical>
        <ParentComponentErrorWrapper>
          <RbacButton
            data-testid="launchBtn"
            intent="primary"
            variation={ButtonVariation.PRIMARY}
            icon="play"
            text={getString('launchExperiment')}
            permission={PermissionGroup.EDITOR}
            onClick={e => {
              e.stopPropagation(); // Prevents the card from being clicked
              launchExperiment();
            }}
          />
        </ParentComponentErrorWrapper>
      </Layout.Horizontal>
    </Card>
  );
}

export default withErrorBoundary(PredefinedExperimentCard, { FallbackComponent: Fallback });
