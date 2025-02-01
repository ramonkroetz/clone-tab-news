type ErrorInfo = {
  name: string
  message: string
  action: string
  status_code: number
}

export function checkIfIsError(data: unknown) {
  return (
    typeof data === 'object' && data && 'name' in data && 'message' in data && 'action' in data && 'status_code' in data
  )
}

export class InternalServerError extends Error {
  action: string
  statusCode: number

  constructor({ cause, statusCode }: { cause: unknown; statusCode?: number }) {
    super('An unexpected error occur.', {
      cause,
    })
    this.name = 'InternalServerError'
    this.action = 'Call support team.'
    this.statusCode = statusCode || 500
  }

  toJSON(): ErrorInfo {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class MethodNotAllowedError extends Error {
  action: string
  statusCode: number

  constructor() {
    super('Method not allowed.')
    this.name = 'MethodNotAllowedError'
    this.action = 'Check HTTP method.'
    this.statusCode = 405
  }

  toJSON(): ErrorInfo {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}

export class ServiceError extends Error {
  action: string
  statusCode: number

  constructor({ cause, message }: { cause: unknown; message: string }) {
    super(message || 'Service unavailable.', { cause })
    this.name = 'ServiceError'
    this.action = 'Check if the service is available.'
    this.statusCode = 503
  }

  toJSON(): ErrorInfo {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}
