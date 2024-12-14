import type { Config } from 'jest'
import nextJest from 'next/jest'
import dotenv from 'dotenv'

dotenv.config({
  path: '.env.development',
})

const createJestConfig = nextJest({
  dir: '.',
})

const config: Config = {
  moduleDirectories: ['node_modules', '<rootDir>'],
}

export default createJestConfig(config)
