export async function api<T>(url: string) {
  const response = await fetch(url)
  const data = (await response.json()) as T

  return {
    status: response.status,
    data,
  }
}
