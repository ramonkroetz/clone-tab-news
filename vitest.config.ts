import path from 'node:path'

import dotenv from 'dotenv'
import { defineConfig } from 'vitest/config'

dotenv.config({
  path: '.env.development',
})

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 60000,
    hookTimeout: 60000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      infra: path.resolve(__dirname, './infra'),
      pages: path.resolve(__dirname, './pages'),
      tests: path.resolve(__dirname, './tests'),
    },
  },
})
