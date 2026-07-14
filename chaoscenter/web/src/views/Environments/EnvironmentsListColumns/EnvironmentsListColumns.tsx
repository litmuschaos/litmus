import React from 'react';
import cx from 'classnames';
import { Avatar, Layout, Text } from '@harnessio/uicore';
import { Color } from '@harnessio/design-system';
import { defaultTo, isEmpty } from 'lodash-es';
import type { Row } from 'react-table';
import { useStrings } from '@strings';
import CustomTagsPopover from '@components/CustomTagsPopover';
import { EnvironmentType } from '@api/entities';
import { getDetailedTime } from '@utils';
import type { EnvironmentDetails } from '../../../controllers/Environments/types';
import css from './EnvironmentsListColumns.module.scss';

interface EnvironmentRow {
  row: Row<EnvironmentDetails>;
}

export enum DeploymentStatus {
  SUCCESS = 'success',
  FAILED = 'failed'
}

const EnvironmentName = ({ row: { original: data } }: EnvironmentRow): React.ReactElement => {
  const { getString } = useStrings();

  const { name, tags, environmentID } = data;

  return (
    <Layout.Vertical>
      <Layout.Horizontal flex={{ justifyContent: 'flex-start' }} spacing="small" margin={{ bottom: 'small' }}>
        <Text color={Color.BLACK}>{name}</Text>
        {!isEmpty(tags) && <CustomTagsPopover tags={defaultTo(tags, [])} />}
      </Layout.Horizontal>

      <Text color={Color.GREY_500} font={{ size: 'small' }} lineClamp={1}>
        {getString('id')}: {environmentID}
      </Text>
    </Layout.Vertical>
  );
};

const EnvironmentDescription = ({ row }: EnvironmentRow): React.ReactElement => {
  const environment = row.original;
  return (
    <Layout.Vertical className={css.sourceDestinationWrapper}>
      <div className={css.destination}>
        <Text lineClamp={1} className={css.content}>
          {environment?.description}
        </Text>
      </div>
    </Layout.Vertical>
  );
};

const EnvironmentTypes = ({ row: { original: data } }: EnvironmentRow): React.ReactElement => {
  const { type } = data;
  return (
    <Text
      className={cx(css.environmentType, { [css.production]: type === EnvironmentType.PROD })}
      font={{ size: 'small' }}
    >
      {type === EnvironmentType.PROD ? 'Prod' : 'Pre-Prod'}
    </Text>
  );
};

const LastUpdatedBy = ({ row: { original: data } }: EnvironmentRow): React.ReactElement => {
  const { getString } = useStrings();
  return (
    <Layout.Horizontal flex={{ align: 'center-center', justifyContent: 'flex-start' }}>
      <Avatar hoverCard={false} name={data.updatedBy?.username ?? getString('chaosController')} size="normal" />
      <Layout.Vertical spacing={'xsmall'}>
        <Text font={{ size: 'small', weight: 'semi-bold' }} color={Color.GREY_900} lineClamp={1}>
          {data.updatedBy?.username ?? getString('chaosController')}
        </Text>
        <Text font={{ size: 'xsmall' }} color={Color.GREY_500} lineClamp={1}>
          {getDetailedTime(data.updatedAt)}
        </Text>
      </Layout.Vertical>
    </Layout.Horizontal>
  );
};

export { EnvironmentName, EnvironmentDescription, EnvironmentTypes, LastUpdatedBy };
