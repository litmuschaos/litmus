import type { IStringifyOptions } from 'qs';
import { stringify } from 'qs';

const JSON_HEADERS = ['application/json'];

export interface FetcherOptions<TQueryParams = never, TBody = never> extends Omit<RequestInit, 'body' | 'headers'> {
  url: string;
  queryParams?: TQueryParams extends never ? undefined : TQueryParams;
  body?: TBody extends never ? undefined : TBody;
  stringifyQueryParamsOptions?: IStringifyOptions;
  headers?: Record<string, string>;
}

export async function fetcher<TResponse = unknown, TQueryParams = never, TBody = never>(
  options: FetcherOptions<TQueryParams, TBody>
): Promise<TResponse> {
  const { stringifyQueryParamsOptions, headers, body, url, queryParams, ...rest } = options;

  const token = localStorage.getItem('accessToken');
  let finalUrl = url;
  const finalQueryParams: Record<string, string> = {};

  if (queryParams) {
    Object.assign(finalQueryParams, queryParams);
  }

  finalUrl += stringify(finalQueryParams, { ...stringifyQueryParamsOptions, addQueryPrefix: true });

  const headersObj: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
    ...(headers ? headers : {})
  };

  const response = await fetch(finalUrl, {
    headers: headersObj,
    body: body ? JSON.stringify(body) : undefined,
    ...rest
  });

  const contentType = response.headers.get('Content-Type');
  const asJson = contentType && JSON_HEADERS.some(h => contentType.startsWith(h));

  const data = await (asJson ? response.json() : response.text());

  if (response.ok) {
    return data;
  }

  throw data;
}
