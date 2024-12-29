type ApiResponse<T> = {
  status?: number
  data: T | null
  error: unknown
}

export async function api<T>(url: string, init?: RequestInit): Promise<ApiResponse<T>> {
  let response

  try {
    response = await fetch(url, init)

    const data = (await response.json()) as T & { error: string }

    if (data.error) {
      throw new Error(data.error)
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
