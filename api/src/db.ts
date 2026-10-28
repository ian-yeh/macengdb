import type { Context, MiddlewareHandler } from 'hono'
import { zValidator } from '@hono/zod-validator'
import postgres from 'postgres'
import { z } from 'zod'

export type AppEnv = { Bindings: Cloudflare.Env; Variables: { sql: postgres.Sql } }

// pydantic-style naive datetime: no zone, microseconds padded to 6 digits or omitted when zero
const ts = (s: string) => {
  const [d, f] = s.replace(' ', 'T').split('.')
  return f ? `${d}.${f.padEnd(6, '0')}` : d
}

export const db: MiddlewareHandler<AppEnv> = async (c, next) => {
  c.set(
    'sql',
    postgres(c.env.HYPERDRIVE.connectionString, {
      max: 5,
      types: { ts: { to: 1114, from: [1114], serialize: (x: string) => x, parse: ts } },
    }),
  )
  await next()
  c.executionCtx.waitUntil(c.var.sql.end())
}

type Result = { target: string } & ({ success: true } | { success: false; error: { issues: readonly z.core.$ZodIssue[] } })

const hook = (r: Result, c: Context) => {
  if (!r.success)
    return c.json(
      {
        detail: r.error.issues.map((i) => ({
          loc: [r.target === 'json' ? 'body' : r.target, ...i.path],
          msg: i.message,
          type: i.code,
        })),
      },
      422,
    )
}

export const validate = <T extends z.ZodType, K extends 'json' | 'query'>(target: K, schema: T) =>
  zValidator(target, schema, hook)

type Limiter = { [K in keyof Cloudflare.Env]: Cloudflare.Env[K] extends RateLimit ? K : never }[keyof Cloudflare.Env]

export const limit =
  (binding: Limiter): MiddlewareHandler<AppEnv> =>
  async (c, next) => {
    const { success } = await c.env[binding].limit({ key: c.req.header('cf-connecting-ip') ?? 'unknown' })
    if (!success) return c.json({ detail: 'Rate limit exceeded' }, 429)
    await next()
  }

export const NOW = "now() AT TIME ZONE 'utc'"


// UPDATE ... SET ${patch(sql, body)}: the keys present in a PATCH body, plus updated_at
export const patch = (sql: postgres.Sql, body: object) =>
  sql({ ...body, updated_at: sql.unsafe(NOW) } as Record<string, any>)

export const email = z
  .string()
  .max(255)
  .transform((v) => v.trim().toLowerCase())
  .refine((v) => v.endsWith('@mcmaster.ca'), 'Must be a McMaster email address (@mcmaster.ca)')

const DIFFICULTY = 'Difficulty must be between 1 and 5'
export const difficulty = z.number().int().min(1, DIFFICULTY).max(5, DIFFICULTY)
