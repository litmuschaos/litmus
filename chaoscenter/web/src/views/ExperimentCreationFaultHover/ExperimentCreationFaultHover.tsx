import React from 'react';
import { Text } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { parse } from 'yaml';
import config from '@config';
import { getScope } from '@utils';
import Cluster from '@images/Cluster.svg';
import Loader from '@components/Loader';
import type { ChaosHub } from '@api/entities';
import type { ChaosFaultData } from '@views/ExperimentCreationSelectFault/types';
import css from './ExperimentCreationFaultHover.module.scss';

interface ExperimentCreationFaultHoverViewProps {
  selectedHub: ChaosHub | undefined;
  faultData: ChaosFaultData | undefined;
  loading: {
    getChaosFault: boolean;
  };
}

export default function ExperimentCreationFaultHoverView({
  selectedHub,
  faultData,
  loading
}: ExperimentCreationFaultHoverViewProps): React.ReactElement {
  const scope = getScope();
  const faultCSV = parse(faultData?.faultCSV ?? '');
  return (
    <div className={css.root}>
      <Loader loading={loading.getChaosFault} small>
        {!loading.getChaosFault && (
          <>
            <img
              className={css.experimentIcon}
              src={
                selectedHub?.isDefault
                  ? `${config.restEndpoints?.chaosManagerUri}/icon/default/${selectedHub?.name}/${faultData?.category}/${faultData?.fault.name}.png`
                  : `${config.restEndpoints?.chaosManagerUri}/icon/${scope.projectID}/${selectedHub?.name}/${faultData?.category}/${faultData?.fault.name}.png`
              }
              alt={`${faultData?.fault.name} icon`}
            />

            <Text className={css.heading} font={{ size: 'large', weight: 'bold' }} color={Color.GREY_900}>
              {faultCSV?.spec?.displayName}
            </Text>
            <Text className={css.description} font={{ size: 'normal', weight: 'light' }} color={Color.BLACK}>
              {faultCSV?.spec?.categoryDescription}
            </Text>
            <img className={css.bottomIcon} src={Cluster} alt="cluster" />
          </>
        )}
      </Loader>
    </div>
  );
}
