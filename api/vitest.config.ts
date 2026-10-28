import { cloudflareTest } from '@cloudflare/vitest-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    cloudflareTest({
      wrangler: { configPath: './wrangler.jsonc' },
      miniflare: { bindings: { ADMIN_SECRET_KEY: 'test-key' } },
    }),
  ],
  // db.test.ts shares one Postgres database
  test: { fileParallelism: false },
})
