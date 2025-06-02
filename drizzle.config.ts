import { defineConfig } from 'drizzle-kit'

import env from '@/env-runtime'

// The code doesn't run in Cloudflare workers, it only runs locally to create table in drizzle studio
// create env-runtime.ts file to fix running drizzle studio
export default defineConfig({
  // dialect: 'sqlite', // this is for local sqlite
  dialect: 'turso',
  schema: './src/db/schema.ts',
  out: './src/db/migrations',
  dbCredentials: {
    url: env.DATABASE_URL,
    // token: env.DATABASE_AUTH_TOKEN, // this is for local sqlite
    authToken: env.DATABASE_AUTH_TOKEN,
  },
})

// "pnpm drizzle-kit generate" or "pnpm drizzle-kit generate --config=drizzle.config.ts" to generate migrations
// "pnpm drizzle-kit push" to push the migrations to the database
// then you will see a dev.db sqlite file in the root of the project (dev.db is the file we set up in .env file)
// add dev.db to .gitignore
// "pnpm drizzle-kit studio": the built-in web based tool to open the studio to view the database
