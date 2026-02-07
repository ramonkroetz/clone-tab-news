import { exec } from 'node:child_process'

import chalk from 'chalk'

function checkPostgres() {
  exec('docker exec postgres-dev pg_isready --host localhost', (_error, stdout) => {
    if (stdout.search('accepting connections') === -1) {
      process.stdout.write(chalk.gray('.'))
      checkPostgres()
      return
    }

    console.log(chalk.green('Postgres is ready and accepting connections!'))
  })
}

console.log(chalk.yellow('Waiting Postgres to accept connections!'))
checkPostgres()
