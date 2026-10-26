import { Layout, Thumbnail, VisualYamlSelectedView } from '@harnessio/uicore';
import type { IconName } from '@harnessio/icons';
import React from 'react';
import type { FormikHelpers } from 'formik';
import { useParams } from 'react-router-dom';
import { useStrings } from '@strings';
import { useUpdateSearchParams } from '@hooks';
import type { ExperimentMetadata } from '@db';
import { InfrastructureType } from '@api/entities';
import experimentYamlService from '@services/experiment';

interface ChaosInfrastructureTypeThumbnailData {
  cardName: InfrastructureType;
  name: string;
  iconName: IconName;
}

interface ChaosInfrastructureTypeThumbnailProps {
  setFieldValue: FormikHelpers<ExperimentMetadata>['setFieldValue'];
  infrastructureType: InfrastructureType;
  disabled: boolean;
  setViewFilter: React.Dispatch<React.SetStateAction<VisualYamlSelectedView>>;
}

export default function ChaosInfrastructureTypeThumbnail({
  setFieldValue,
  disabled,
  infrastructureType,
  setViewFilter
}: ChaosInfrastructureTypeThumbnailProps): React.ReactElement {
  const { getString } = useStrings();
  const updateSearchParams = useUpdateSearchParams();
  const { experimentKey } = useParams<{ experimentKey: string }>();
  const experimentHandler = experimentYamlService.getInfrastructureTypeHandler(InfrastructureType.KUBERNETES);

  const ChaosInfrastructureTypeThumbnailData: Array<ChaosInfrastructureTypeThumbnailData> = [
    {
      cardName: InfrastructureType.KUBERNETES,
      name: getString('kubernetes'),
      iconName: 'chaos-litmuschaos' as IconName
    }
  ];

  return (
    <Layout.Horizontal spacing={'medium'}>
      {ChaosInfrastructureTypeThumbnailData.map(item => {
        return (
          <Thumbnail
            disabled={disabled}
            key={item.cardName}
            label={item.name}
            value={item.cardName}
            icon={item.iconName}
            selected={item.cardName === infrastructureType}
            onClick={thumbnail => {
              if (thumbnail.target.value === infrastructureType) return;
              experimentHandler?.clearExperimentManifest(experimentKey);
              setViewFilter(VisualYamlSelectedView.VISUAL);
              setFieldValue('chaosInfrastructure.id', '', false);
              setFieldValue('chaosInfrastructure.type', thumbnail.target.value, false);
              updateSearchParams({ infrastructureType: thumbnail.target.value });
            }}
          />
        );
      })}
    </Layout.Horizontal>
  );
}
