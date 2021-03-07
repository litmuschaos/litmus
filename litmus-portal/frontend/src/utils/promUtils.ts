import { ChaosEngineNamesAndNamespacesMap } from '../models/dashboardsData';

const getEngineNameAndNamespace = (chaosQueryString: string) => {
  const parsedChaosInfoMap: ChaosEngineNamesAndNamespacesMap = {
    engineName: chaosQueryString
      .split(',')[1]
      .trim()
      .split('=')[1]
      .slice(1, -1),
    engineNamespace: chaosQueryString
      .split(',')[2]
      .trim()
      .split('=')[1]
      .slice(1, -1),
    workflowName: '',
  };
  return parsedChaosInfoMap;
};

export default getEngineNameAndNamespace;
