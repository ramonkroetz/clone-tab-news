import { StatusResponse } from './api/v1/status'
import { useApi } from 'hooks/useApi'

function UpdateAt() {
  const { data, isLoading, error } = useApi<StatusResponse>('/api/v1/status', {
    configSWR: {
      refreshInterval: 2000,
    },
  })

  let updateAtText = 'Loading ...'

  if (!isLoading && data) {
    updateAtText = new Date(data.update_at).toLocaleString('pt-BR')
  }

  if (error) {
    updateAtText = typeof error === 'string' ? error : error.message
  }

  return <div>Last Update: {updateAtText}</div>
}

function DatabaseStatus() {
  const { data, isLoading, error } = useApi<StatusResponse>('/api/v1/status', {
    configSWR: {
      refreshInterval: 2000,
    },
  })

  const title = <h2>Database</h2>

  if (isLoading) {
    return (
      <>
        {title}
        <p>Loading...</p>
      </>
    )
  }

  if (data) {
    return (
      <>
        {title}
        <p>Version: {data.dependencies.database.version}</p>
        <p>Opened Connections: {data.dependencies.database.opened_connections}</p>
        <p>Max Connections: {data.dependencies.database.max_connections}</p>
      </>
    )
  }

  return (
    <>
      {title}
      <p>{JSON.stringify(error, null, 2)}</p>
    </>
  )
}

export default function StatusPage() {
  return (
    <>
      <h1>Status</h1>
      <UpdateAt />
      <DatabaseStatus />
    </>
  )
}
