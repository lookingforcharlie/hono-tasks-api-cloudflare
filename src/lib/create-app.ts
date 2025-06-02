// extract the app into a separate file to separate it from the node server
// because hono is agnostic to runtime

import type { Schema } from 'hono'

import { OpenAPIHono } from '@hono/zod-openapi'
import { notFound, onError, serveEmojiFavicon } from 'stoker/middlewares'
import { defaultHook } from 'stoker/openapi'

import type { AppOpenAPI, CustomAppBindings } from '@/lib/types'

import { pinoLogger } from '@/middlewares/pino-logger'

import { parseEnv } from '../env'

// create a stand alone router instance with any middlewares
export function createRouter() {
  // with strict set to false, /error and /error/ will be treated as the same path
  // defaultHook: return validation errors as a json response
  // defaultHook runs if there's ever a validation error from an openapi route handler and it's not handled by the route handler itself
  return new OpenAPIHono<CustomAppBindings>({
    strict: false, // localhost:9999/error and localhost:9999/error/ will be treated as the same path
    defaultHook, // Default hook source code : https://github.com/w3cj/stoker/blob/main/src/openapi/default-hook.ts
  })
}

// reusable function to create a new app and include the middlewares
// we can call this when testing
export default function createApp() {
  const app = createRouter()

  // having the middleware here that's the first thing that runs before any other middleware and handler
  // c.env looks like this:
  // {
  //   NODE_ENV: 'development',
  //   PORT: '9999',
  //   LOG_LEVEL: 'debug',
  //   DATABASE_URL: 'libsql://tasks.whatever.io',
  //   DATABASE_AUTH_TOKEN: 'bGciOiJFZikwERTsI99nR5cNzVh'
  // }
  app.use((c, next) => {
    // Validate the env
    // c.env is all the built-in secrets and variables that get passed to your handler
    // type of c.env can be set in CustomAppBindings

    // c.env = parseEnv(c.env || process.env)
    // eslint-disable-next-line node/no-process-env
    c.env = parseEnv(Object.assign(c.env || {}, process.env))
    // anywhere in the app, we need to use those environment variables, we can access it through c.env
    // whenever we are running the code not inside Cloudflare, we still can access the env through process.env because we are doing c.env = parseEnv(Object.assign(c.env, process.env))
    // if we are not running in Cloudflare, we need to use process.env, and c.env is empty object

    return next()
  })

  app.use(serveEmojiFavicon('⛲'))
  app.use(pinoLogger())
  app.notFound(notFound)
  app.onError(onError)

  return app
}

// create a app dedicated for testing with the router mounted on it, now we can get the response from the router when testing
export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
  // now testApp is inferred as Hono<CustomAppBindings, S>
  const testApp = createApp().route('/', router)
  return testApp
}

// this version doesn't return a full typed app, but a router, because TS inference works better with chaining
// export function createTestApp<S extends Schema>(router: AppOpenAPI<S>) {
//   const testApp = createApp()
//   testApp.route('/', router) // mount the router on the test app
//   return testApp
// }
