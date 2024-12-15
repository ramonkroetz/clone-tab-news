import chalk from 'chalk'
import { exec } from 'node:child_process'

function checkPostgres() {
  exec('docker exec postgres-dev pg_isready --host localhost', (error, stdout) => {
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
