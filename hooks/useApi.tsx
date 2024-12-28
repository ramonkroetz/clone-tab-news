import { api } from 'helpers/api'
import useSWR, { SWRConfiguration } from 'swr'

type UseAPIConfig = {
  configFetch?: RequestInit
  configSWR?: SWRConfiguration
}

export function useApi<T>(url: string, { configFetch, configSWR }: UseAPIConfig) {
  async function fetcher() {
    const response = await api<T>(url, configFetch)
    if (response.error) throw response.error
    return response.data as T
  }

  return useSWR<T, Error | string>(url, fetcher, configSWR)
}
