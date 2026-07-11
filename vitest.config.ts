import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    passWithNoTests: true,
  },
  resolve: {
    alias: { '@': resolve(__dirname, '.') },
  },
})
