import { ChaosResultNamesAndNamespacesMap } from '../models/dashboardsData';

const getResultNameAndNamespace = (chaosQueryString: string) => {
  const parsedChaosInfoMap: ChaosResultNamesAndNamespacesMap = {
    resultName: chaosQueryString
      .split(',')[0]
      .trim()
      .split('=')[1]
      .slice(1, -1),
    resultNamespace: chaosQueryString
      .split(',')[1]
      .trim()
      .split('=')[1]
      .slice(1, -1),
    workflowName: '',
  };
  return parsedChaosInfoMap;
};

export default getResultNameAndNamespace;
