export async function api<T>(url: string, init?: RequestInit) {
  let response

  try {
    response = await fetch(url, init)

    return {
      status: response.status,
      data: (await response.json()) as T,
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
