export async function api<T>(url: string, init?: RequestInit) {
  const response = await fetch(url, init)
  const data = (await response.json()) as T

  return {
    status: response.status,
    data,
  }
}
