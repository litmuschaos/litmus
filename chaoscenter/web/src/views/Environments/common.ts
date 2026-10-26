import { createContext, createRef, Dispatch, MutableRefObject, SetStateAction, useContext } from 'react';
import { noop } from 'lodash-es';

export enum Views {
  LIST,
  INSIGHT
}

export interface EnvironmentStore {
  view: Views;
  setView: Dispatch<SetStateAction<Views>>;
  fetchDeploymentList: MutableRefObject<(() => void) | unknown>;
}

export const EnvironmentStoreContext = createContext({
  view: Views.INSIGHT,
  setView: noop,
  fetchDeploymentList: createRef()
});

export const useEnvironmentStore = (): EnvironmentStore => useContext(EnvironmentStoreContext);
