import React from 'react';
import { TableV2, Text } from '@harnessio/uicore';
import { withErrorBoundary } from 'react-error-boundary';
import type { Cell, Column } from 'react-table';
import classnames from 'classnames';
import type { HTTPMethod } from '@models';
import { Fallback } from '@errors';
import type { HTTPProbeDetailsType, ProbePropertiesProps } from '@views/ChaosProbeConfiguration';
import { useStrings } from '@strings';
import { useSearchParams } from '@hooks';
import { InfrastructureType } from '@api/entities';
import { checkAndReturn } from '../ProbeProperties';
import css from '../../ChaosProbeConfiguration.module.scss';

interface HTTPMethodProps {
  GET: string;
  POST: string;
}

function HTTPProbeDetails({
  kubernetesHTTPProperties
}: Pick<ProbePropertiesProps, 'kubernetesHTTPProperties'>): React.ReactElement {
  const { getString } = useStrings();
  const searchParams = useSearchParams();
  const infrastructureType = searchParams.get('infrastructureType') as InfrastructureType;
  const columns: Column<HTTPProbeDetailsType>[] = React.useMemo(
    () => [
      {
        Header: `${getString('url')}`.toLocaleUpperCase(),
        accessor: 'url',
        Cell: (props: Cell<HTTPProbeDetailsType>) => <Text lineClamp={1}>{checkAndReturn(props.value)}</Text>
      },
      {
        Header: `${getString('insecureSkipVerify')}`.toLocaleUpperCase(),
        accessor: 'insecureSkipVerify',
        Cell: (props: Cell<HTTPProbeDetailsType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('method')}`.toLocaleUpperCase(),
        accessor: 'method',
        Cell: (props: Cell<HTTPProbeDetailsType>) => {
          if (props.value.get) return 'GET';
          else return 'POST';
        }
      },
      {
        Header: `${getString('criteria')}`.toLocaleUpperCase(),
        accessor: 'criteria',
        Cell: (props: Cell<HTTPProbeDetailsType>) => checkAndReturn(props.value)
      },
      {
        Header: `${getString('responseCode')}`.toLocaleUpperCase(),
        accessor: 'responseCode',
        Cell: (props: Cell<HTTPProbeDetailsType>) => checkAndReturn(props.value)
      }
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  function returnMethodValue({ GET, POST }: HTTPMethodProps): string | undefined {
    if (infrastructureType === InfrastructureType.KUBERNETES) {
      if (kubernetesHTTPProperties?.method?.get !== undefined) return GET;
      else if (kubernetesHTTPProperties?.method?.post !== undefined) return POST;
    }
  }

  const probeDetails: HTTPProbeDetailsType[] =
    infrastructureType === InfrastructureType.KUBERNETES
      ? [
          {
            url: kubernetesHTTPProperties?.url ?? '',
            insecureSkipVerify: kubernetesHTTPProperties?.insecureSkipVerify,
            method: kubernetesHTTPProperties?.method as HTTPMethod,
            criteria: returnMethodValue({
              GET: kubernetesHTTPProperties?.method?.get?.criteria ?? '',
              POST: kubernetesHTTPProperties?.method?.post?.criteria ?? ''
            }),
            responseCode: returnMethodValue({
              GET: kubernetesHTTPProperties?.method?.get?.responseCode ?? '',
              POST: kubernetesHTTPProperties?.method?.post?.responseCode ?? ''
            })
          }
        ]
      : [];

  return <TableV2 columns={columns} data={probeDetails} className={classnames(css.table, css.httpDetails)} minimal />;
}

export default withErrorBoundary(HTTPProbeDetails, { FallbackComponent: Fallback });
