import type {
  QueryResult,
  MutationTuple,
  BaseMutationOptions,
  OperationVariables,
  QueryFunctionOptions,
  QueryTuple,
  SubscriptionHookOptions,
  SubscriptionResult,
  LazyQueryHookOptions
} from '@apollo/client';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { SWRConfiguration, SWRResponse } from 'swr';
import type { Identifiers } from './entities';

// GraphQL types
export type GqlAPIQueryRequest<TData, TVariables, Request = OperationVariables> = Identifiers &
  Request & {
    options?: QueryFunctionOptions<TData, TVariables>;
  };

export type GqlAPIQueryResponse<TData, TVariables> = Omit<
  QueryResult<TData, TVariables>,
  'subscribeToMore' | 'updateQuery'
> & {
  exists?: boolean | undefined;
};

export type GqlAPILazyQueryRequest<TData, TVariables> = Omit<LazyQueryHookOptions<TData, TVariables>, 'query'>;

export type GqlAPILazyQueryResponse<TData, TVariables> = Omit<
  QueryTuple<TData, TVariables>,
  'subscribeToMore' | 'updateQuery'
>;

export type GqlAPIMutationRequest<TData, TVariables> = BaseMutationOptions<TData, TVariables>;

export type GqlAPIMutationResponse<TData, TVariables> = MutationTuple<TData, TVariables>;

export type MutationFunction<TData, TVariables> = MutationTuple<TData, TVariables>[0];

export type LazyQueryFunction<TData, TVariables> = QueryTuple<TData, TVariables>[0];

export type GqlAPISubscriptionRequest<TData, TVariables = OperationVariables> = TVariables &
  Omit<SubscriptionHookOptions<TData, TVariables>, 'variables'>;

export type GqlAPISubscriptionResponse<TData, TVariables = OperationVariables> = SubscriptionResult<TData, TVariables>;

// REST types
export type GetRequest = AxiosRequestConfig | null;

export interface Return<Data, Error>
  extends Pick<SWRResponse<AxiosResponse<Data>, AxiosError<Error>>, 'isValidating' | 'error' | 'mutate'> {
  data: Data | undefined;
  loading: boolean;
  response: AxiosResponse<Data> | undefined;
}

export interface Config<Data = unknown, Error = unknown>
  extends Omit<SWRConfiguration<AxiosResponse<Data>, AxiosError<Error>>, 'fallbackData'> {
  fallbackData?: Data;
}

export interface RestAPIResponse<Data> extends Omit<Partial<Return<Data, unknown>>, 'loading'> {
  loading: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type RestError<T = unknown, D = any> = AxiosError<T, D> | undefined;
