import type { Context, MiddlewareHandler } from 'hono'
import type { Env } from 'hono-pino'

import { pinoLogger as logger } from 'hono-pino'
import pino from 'pino'
import pretty from 'pino-pretty'

import type { CustomAppBindings } from '../lib/types'

export function pinoLogger() {
  return ((c, next) =>
    logger({
      // Try NODE_ENV=production pn run dev in terminal, you will see the logger without pretty, because we need consume all the logger content in production mode
      pino: pino(
        {
          level: c.env.LOG_LEVEL || 'info',
        },
        c.env.NODE_ENV === 'production' ? undefined : pretty(),
      ),
      http: {
        reqId: () => crypto.randomUUID(), // make request id unique instead of adding it up by default
      },
    })(
      c as unknown as Context<Env>,
      next,
    )) satisfies MiddlewareHandler<CustomAppBindings>
}

// set up the pinoLogger as middleware
