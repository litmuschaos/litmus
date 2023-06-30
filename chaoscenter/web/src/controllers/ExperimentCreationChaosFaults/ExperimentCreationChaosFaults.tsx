import React from 'react';
import { useToaster } from '@harness/uicore';
import { cloneDeep } from 'lodash-es';
import { replaceHyphen, replaceSpace } from '@utils';
import ExperimentCreationChaosFaultsView from '@views/ExperimentCreationSelectFault/ExperimentCreationChaosFaults';
import { getChaosFaultLazyQuery } from '@api/core';
import type { ChaosHub, Chart } from '@api/entities';
import type { FaultData } from '@models';

interface ExperimentCreationChaosFaultsControllerProps {
  onSelect: (data: FaultData) => void;
  selectedHub: ChaosHub | undefined;
  chaosCharts: Chart[] | undefined;
  loading: {
    listChaosHub: boolean;
    listChaosFaults: boolean;
  };
  searchParam: string;
}

export default function ExperimentCreationChaosFaultsController({
  onSelect,
  selectedHub,
  chaosCharts,
  loading,
  searchParam
}: ExperimentCreationChaosFaultsControllerProps): React.ReactElement {
  const { showError } = useToaster();

  const [getChaosFaultQuery, { loading: getChaosFaultLoading }] = getChaosFaultLazyQuery({
    onError: err => showError(err.message),
    fetchPolicy: 'cache-first'
  });

  const filteredCharts = chaosCharts?.filter(chart => {
    const deepCopyChart = cloneDeep(chart);
    deepCopyChart.spec.faults = chart.spec.faults.filter(fault =>
      replaceHyphen(fault.name).includes(replaceSpace(replaceHyphen(searchParam)).toLocaleLowerCase())
    );

    if (deepCopyChart.spec.faults.length > 0) return deepCopyChart;
  });

  return (
    <ExperimentCreationChaosFaultsView
      onSelect={onSelect}
      loading={{ ...loading, getChaosFault: getChaosFaultLoading }}
      selectedHub={selectedHub}
      getChaosFaultQuery={getChaosFaultQuery}
      filteredCharts={filteredCharts}
    />
  );
}
