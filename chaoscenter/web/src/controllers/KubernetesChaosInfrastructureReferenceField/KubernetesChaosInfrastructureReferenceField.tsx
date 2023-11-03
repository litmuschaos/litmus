import { Pagination, useToaster } from '@harnessio/uicore';
import React from 'react';
import { listChaosInfra } from '@api/core';
import { getScope } from '@utils';
import ChaosInfrastructureReferenceFieldView from '@views/ChaosInfrastructureReferenceField';
import type { ChaosInfrastructureReferenceFieldProps } from '@models';
import type { InfrastructureDetails } from '@views/ChaosInfrastructureReferenceField/ChaosInfrastructureReferenceField';

function KubernetesChaosInfrastructureReferenceFieldController({
  setFieldValue,
  initialInfrastructureID
}: ChaosInfrastructureReferenceFieldProps): React.ReactElement {
  const scope = getScope();
  const { showError } = useToaster();
  const [searchInfrastructure, setSearchInfrastructure] = React.useState<string>('');

  const [page, setPage] = React.useState<number>(0);
  const limit = 8;

  const { data: listChaosInfraData, loading: listChaosInfraLoading } = listChaosInfra({
    ...scope,
    filter: { name: searchInfrastructure, isActive: true },
    pagination: { page, limit },
    options: { onError: error => showError(error.message) }
  });

  // TODO: replace with get API as this becomes empty during edit
  const preSelectedInfrastructure = listChaosInfraData?.listInfras.infras.find(
    ({ infraID }) => infraID === initialInfrastructureID
  );
  const preSelectedInfrastructureDetails: InfrastructureDetails | undefined = preSelectedInfrastructure && {
    id: preSelectedInfrastructure?.infraID,
    name: preSelectedInfrastructure?.name,
    tags: preSelectedInfrastructure?.tags,
    isActive: preSelectedInfrastructure?.isActive,
    noOfExperiments: preSelectedInfrastructure?.noOfExperiments,
    noOfExperimentsRuns: preSelectedInfrastructure?.noOfExperimentRuns,
    environmentID: preSelectedInfrastructure?.environmentID
  };

  React.useEffect(() => {
    if (preSelectedInfrastructure) {
      setFieldValue('chaosInfrastructure.id', preSelectedInfrastructure.infraID, true);
      setFieldValue('chaosInfrastructure.namespace', preSelectedInfrastructure.infraNamespace, false);
      setFieldValue('chaosInfrastructure.serviceAccount', preSelectedInfrastructure.serviceAccount, false);
      setFieldValue('chaosInfrastructure.environmentID', preSelectedInfrastructure.environmentID, false);
    }
  }, [preSelectedInfrastructure, setFieldValue]);

  const infrastructureList = listChaosInfraData?.listInfras.infras.map(infra => {
    const infraDetails: InfrastructureDetails = {
      id: infra.infraID,
      name: infra.name,
      tags: infra.tags,
      isActive: infra.isActive,
      noOfExperiments: infra.noOfExperiments,
      noOfExperimentsRuns: infra.noOfExperimentRuns,
      namespace: infra.infraNamespace,
      environmentID: infra.environmentID
    };
    return infraDetails;
  });

  const totalNoOfInfras = listChaosInfraData?.listInfras.totalNoOfInfras ?? 0;
  const PaginationComponent = (): React.ReactElement => {
    return (
      <Pagination
        itemCount={totalNoOfInfras}
        pageSize={limit}
        pageCount={Math.ceil(totalNoOfInfras / limit)}
        pageIndex={page}
        gotoPage={pageNumber => setPage(pageNumber)}
      />
    );
  };

  return (
    <ChaosInfrastructureReferenceFieldView
      infrastructureList={infrastructureList}
      preSelectedInfrastructure={preSelectedInfrastructureDetails}
      setInfrastructureValue={infrastructure => {
        if (infrastructure) {
          setFieldValue('chaosInfrastructure.id', infrastructure.id, true);
          setFieldValue('chaosInfrastructure.namespace', infrastructure.namespace, false);
          setFieldValue('chaosInfrastructure.environmentID', infrastructure.environmentID, false);
        }
      }}
      searchInfrastructure={searchInfrastructure}
      setSearchInfrastructure={setSearchInfrastructure}
      loading={{
        listChaosInfra: listChaosInfraLoading
      }}
      pagination={<PaginationComponent />}
    />
  );
}

export default KubernetesChaosInfrastructureReferenceFieldController;
