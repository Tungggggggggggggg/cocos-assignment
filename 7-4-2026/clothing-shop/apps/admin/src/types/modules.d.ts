declare module 'swr' {
  import { SWRConfiguration, SWRResponse } from 'swr/_internal';
  
  export type { SWRConfiguration, SWRResponse };
  
  function useSWR<Data = unknown, Error = unknown>(
    key: string | unknown[] | null | (() => string | unknown[] | null),
    fetcher?: ((endpoint: string, options?: RequestInit) => Data | Promise<Data>) | null,
    config?: SWRConfiguration<Data, Error>
  ): SWRResponse<Data, Error>;

  export default useSWR;
  export function mutate(key: string | unknown[] | null, data?: unknown, shouldRevalidate?: boolean): Promise<unknown>;
}
