type InternalServerErrorProps = {
  cause: unknown
}

export class InternalServerError extends Error {
  action: string
  statusCode: number

  constructor({ cause }: InternalServerErrorProps) {
    super('An unexpected error occur.', {
      cause,
    })
    this.name = 'InternalServerError'
    this.action = 'Call support team.'
    this.statusCode = 500
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      action: this.action,
      status_code: this.statusCode,
    }
  }
}
