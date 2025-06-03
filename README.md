# Host Hono Project on Cloudflare: [Hono Starter Repo](https://github.com/lookingforcharlie/hono-tasks-api)

- [Inspired by](https://www.youtube.com/watch?v=QDgdUtd6ZRs)

## Endpoints

| Path               | Description              |
| ------------------ | ------------------------ |
| GET /doc           | Open API Specification   |
| GET /reference     | Scalar API Documentation |
| GET /tasks         | List all tasks           |
| POST /tasks        | Create a task            |
| GET /tasks/{id}    | Get one task by id       |
| PATCH /tasks/{id}  | Patch one task by id     |
| DELETE /tasks/{id} | Delete one task by id    |

## Setup

- Build the project first

  ```
  pn build
  ```

- Install tsc-alias to support import alias, and convert it into relative path when build and add file extension, 'import alias' only supported by TS

  ```
  pnpm install -D tsc-alias
  ```

- Update script with tsc-alias

  ```
  "build": "tsc && tsc-alias",
  "start": "node ./dist/src/index.js",
  ```

- update code

  ```
  change:
  import packageJSON from '../../package.json'
  in codebase to:
  import packageJSON from '../../package.json' with { type: 'json' }
  ```

## Setup [Turso](https://turso.tech/) - SQLite database in the cloud before we deploy the code

- Go to Turso website -> Create Group -> Create Database -> Create Token -> get the remote url and token

- Set up remote url and token in the .env file

- Add Turso driver in drizzle.config.ts file

## Prepare for Deployment to Cloudflare

> In Cloudflare, whenever you are working with environment variables or secrets, those are only accessible inside of the request, inside of the [fetch event handler](https://developers.cloudflare.com/workers/runtime-apis/handlers/fetch/), and this is the only way you can get access to environment variables.

> In the original codebase of env.ts file, we use env = EnvSchema.parse(process.env) to access the env, it's not gonna work with Cloudflare

> To fix it, we will setup a runtime env so that way our local build tools need to use the env can work in the same way, but all of the request handlers are going to need to pull in those environment variables from the incoming requests

- Wrangler: Cloudflare CLI tool that allows us to test locally and easily deploy

  ```
  pnpm add -D wrangler@latest
  ```

- Wrangler toml file: [honojs starter](https://github.com/honojs/starter)

- Run Wrangler locally to see if it will work in Cloudflare
  ```
  pn run dev ("dev": "wrangler dev")
  ```
- Setup secrets for Cloudflare workers for local development is by [creating .dev.vars file](https://developers.cloudflare.com/workers/configuration/secrets/#local-development-with-secrets)

- For local development of using wrangler, we need to spin up libSql instance using Turso dev command

  > We could put Turso url and token in the .dev.vars file, but in that case, I will be modifying production Turso database directly when working locally

  > To solve this, we can use [Turso CLI](https://docs.turso.tech/local-development) dev command, which gives us a local host database url we can pass in .dev.vars

- Install Turso CLI on your Mac if needed

  ```
  brew install tursodatabase/tap/turso
  ```

- Install Turso as dev dependency

  ```
  pnpm add -D turso
  ```

- Run pn drizzle-kit push, you will see dev.db is created locally in the root

  ```
  pn drizzle-kit push
  ```

- Update the script for running local turso libSql server, db name needs to align with the schema drizzle-kit push

  ```
    "dev:db": "turso dev --db-file dev.db",
  ```

- Run

  ```
  pnpm run dev:db
  ```

- You will see in the terminal:

  ```
  sqld listening on port 8080.
  Use the following URL to configure your libSQL client SDK for local development:

  http://127.0.0.1:8080
  ```

- Put http://127.0.0.1:8080 into .dev.vars file

  ```
  DATABASE_URL=http://127.0.0.1:8080
  ```

- Two new files are created by Turso Cli, we need to put them into .gitignore file

## Deployment to Cloudflare

- Prepare deploy script in package.json

  ```
  "deploy": "wrangler deploy --minify",
  ```

- Make sure you have Cloudflare account

  ```
  pnpm run deploy
  ```

- Your API doesn't fully function right now, because the env is missing in the Cloudflare

- Setup the env in [Cloudflare](https://developers.cloudflare.com/workers/configuration/environment-variables/)

  > Cloudflare dashboard -> Compute (Workers) -> Click the project -> Settings -> Variables and Secrets -> add Node_Env, log_level, database_url, database_auth_token -> click Deploy

- Run 'pnpm run deploy' locally again, you will see:

  ```
  ▲ [WARNING] You are about to publish a Workers Service that was last published via the Cloudflare Dashboard.

    Edits that have been made via the dashboard will be overridden by your local code and config.

  ✔ Would you like to continue? … no
  ```

- Choose 'no', we don't want this override, we want Wrangler keep variables configured in the dashboard on deploy.

- Add 'keep_vars = true' in wrangler.toml file
  > The env we added in Cloudflare dashboard will not override when we run the local deployment
