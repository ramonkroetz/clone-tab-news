import { api } from 'helpers/api'
import useSWR, { SWRConfiguration } from 'swr'

type UseAPIConfig = {
  configFetch?: RequestInit
  configSWR?: SWRConfiguration
}

export function useApi<T>(url: string, { configFetch, configSWR }: UseAPIConfig) {
  async function fetcher() {
    const { data, error } = await api<T>(url, configFetch)

    if (error instanceof Error) {
      throw new Error(error.message)
    }

    return data as T
  }

  return useSWR<T, Error | string>(url, fetcher, configSWR)
}
