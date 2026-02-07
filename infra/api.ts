import { checkIfIsError } from 'infra/errors'

type ApiResponse<T> = {
  status?: number
  data: T | null
  error: unknown
}

export async function api<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  let response: Response | null = null

  try {
    response = await fetch(url, init)

    const data = await response.json()

    if (checkIfIsError(data)) {
      throw data
    }

    return {
      status: response.status,
      data,
      error: null,
    }
  } catch (error) {
    return {
      status: response?.status,
      data: null,
      error,
    }
  }
}
