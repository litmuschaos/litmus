import { Location } from 'history'; // eslint-disable-line import/no-extraneous-dependencies

export interface LocationState<S> extends Location {
  state: S;
}
