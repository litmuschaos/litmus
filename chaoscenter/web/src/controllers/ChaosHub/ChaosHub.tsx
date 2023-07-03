import React from 'react';
import { useParams } from 'react-router-dom';
import { parse } from 'yaml';
import { getScope } from '@utils';
import { listChaosFaults, listPredefinedExperiment } from '@api/core';
import ChaosHubView from '@views/ChaosHub';

export default function ChaosHubController(): React.ReactElement {
  const { hubID } = useParams<{ hubID: string }>();
  const scope = getScope();

  const { data: predefinedExperiments, loading: listPredefinedExperimentLoading } = listPredefinedExperiment({
    ...scope,
    hubID: hubID,
    options: {
      // eslint-disable-next-line no-console
      onError: error => console.error(error.message),
      nextFetchPolicy: 'cache-first'
    }
  });

  const {
    data: charts,
    error: listChartError,
    loading: listChartLoading
  } = listChaosFaults({
    ...scope,
    hubID: hubID,
    options: {
      // eslint-disable-next-line no-console
      onError: error => console.error(error.message),
      nextFetchPolicy: 'cache-first'
    }
  });

  const predefinedCategoriesSet = new Set<string>();

  // Extract Name of unique keywords/charts
  predefinedExperiments?.listPredefinedExperiments?.map(experiment => {
    parse(experiment.experimentCSV).spec?.keywords?.map((keyword: string) => {
      predefinedCategoriesSet.add(keyword);
    });
  });

  // Count the number of categories
  const predefinedCategories = new Map<string, number>();
  const faultCategories = new Map<string, number>();

  predefinedCategoriesSet.forEach(category => {
    let count = 0;
    predefinedExperiments?.listPredefinedExperiments?.map(experiment => {
      parse(experiment.experimentCSV).spec?.keywords?.map((keyword: string) => {
        if (keyword.toLowerCase() === category.toLowerCase()) count++;
      });
    });
    predefinedCategories.set(category, count);
  });

  charts?.listChaosFaults?.map(experiment => {
    faultCategories.set(experiment.spec.displayName, experiment.spec.faults.length);
  });

  return (
    <ChaosHubView
      predefinedExperiments={predefinedExperiments?.listPredefinedExperiments}
      hubDetails={charts}
      categories={{
        predefinedCategories: predefinedCategories,
        faultCategories: faultCategories
      }}
      loading={{
        listPredefinedExperiment: listPredefinedExperimentLoading,
        listChart: listChartLoading
      }}
      listChartError={listChartError}
    />
  );
}
