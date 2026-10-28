import type { MiddlewareHandler } from 'hono'
import type { AppEnv } from './db'

export const admin: MiddlewareHandler<AppEnv> = async (c, next) => {
  const enc = new TextEncoder()
  const got = enc.encode(c.req.header('x-admin-key') ?? '')
  const want = enc.encode(c.env.ADMIN_SECRET_KEY ?? '')
  if (!got.length || !want.length || got.length !== want.length || !crypto.subtle.timingSafeEqual(got, want))
    return c.json({ detail: 'Invalid admin key' }, 403)
  await next()
}
