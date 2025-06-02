/* eslint-disable node/no-process-env */
import type { Environment } from './env'

import { parseEnv } from './env'

// export default parseEnv({
//   NODE_ENV: process.env.NODE_ENV as string,
//   PORT: Number(process.env.PORT),
//   LOG_LEVEL: process.env.LOG_LEVEL as
//     | 'fatal'
//     | 'error'
//     | 'warn'
//     | 'info'
//     | 'debug'
//     | 'trace'
//     | 'silent',
//   DATABASE_URL: process.env.DATABASE_URL as string,
//   DATABASE_AUTH_TOKEN: process.env.DATABASE_AUTH_TOKEN,
// })

// Any place that does actually need access to this at runtime can import this file
export default parseEnv(process.env as unknown as Environment)
