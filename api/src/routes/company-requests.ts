import { Hono } from 'hono'
import { z } from 'zod'
import { NOW, limit, optionalJson, validate, type AppEnv, type Limiter } from '../db'

const COLS = 'id, name, requester_email, status, created_at'
const name = z.string().max(255).transform((v) => v.trim())

// routes shared by company and design-team requests; each router adds its own approve
export const requests = (app: Hono<AppEnv>, path: 'company-requests' | 'design-team-requests', limiter: Limiter) => {
  const table = path.replaceAll('-', '_')

  app.post(
    `/${path}`,
    limit(limiter),
    validate('json', z.object({ name, requester_email: z.string().max(255).nullish() })),
    async (c) => {
      const sql = c.var.sql
      const b = c.req.valid('json')
      const [row] = await sql`
        INSERT INTO ${sql(table)} (name, requester_email, status, created_at)
        VALUES (${b.name}, ${b.requester_email ? b.requester_email.trim() : null}, 'pending', ${sql.unsafe(NOW)})
        RETURNING ${sql.unsafe(COLS)}`
      return c.json(row)
    },
  )

  app.get(`/admin/${path}`, async (c) => {
    const sql = c.var.sql
    return c.json(await sql`SELECT ${sql.unsafe(COLS)} FROM ${sql(table)} WHERE status = 'pending' ORDER BY created_at DESC`)
  })

  app.patch(`/admin/${path}/:id{[0-9]+}`, validate('json', z.object({ name })), async (c) => {
    const sql = c.var.sql
    const [row] = await sql`
      UPDATE ${sql(table)} SET name = ${c.req.valid('json').name} WHERE id = ${c.req.param('id')} RETURNING ${sql.unsafe(COLS)}`
    return row ? c.json(row) : c.json({ detail: 'Request not found' }, 404)
  })

  app.delete(`/admin/${path}/:id{[0-9]+}`, async (c) => {
    const sql = c.var.sql
    const r = await sql`UPDATE ${sql(table)} SET status = 'rejected' WHERE id = ${c.req.param('id')}`
    return r.count ? c.json({ detail: 'Request rejected' }) : c.json({ detail: 'Request not found' }, 404)
  })

  app.post(`/admin/${path}/bulk-reject`, validate('json', z.array(z.number().int())), async (c) => {
    const sql = c.var.sql
    const r = await sql`UPDATE ${sql(table)} SET status = 'rejected' WHERE id = ANY(${c.req.valid('json')}::int[])`
    return c.json({ detail: `Rejected ${r.count} requests` })
  })
}

const app = new Hono<AppEnv>()
requests(app, 'company-requests', 'COMPANY_REQUEST_LIMITER')

app.patch('/admin/company-requests/:id{[0-9]+}/approve', async (c) => {
  const { bad, data } = await optionalJson(c, z.object({ industries: z.array(z.string().max(100)).default([]) }))
  if (bad) return bad
  const id = c.req.param('id')
  const row = await c.var.sql.begin(async (tx) => {
    const [req] = await tx`SELECT name FROM company_requests WHERE id = ${id} FOR UPDATE`
    if (!req) return
    const [company] = await tx`
      INSERT INTO companies (name, industries, rating, created_at, updated_at)
      VALUES (${req.name}, ${data.industries}::varchar[], 0, ${tx.unsafe(NOW)}, ${tx.unsafe(NOW)})
      RETURNING id, name, industries, rating, created_at, updated_at, 0 AS experience_count`
    await tx`UPDATE company_requests SET status = 'approved' WHERE id = ${id}`
    return company
  })
  return row ? c.json(row) : c.json({ detail: 'Request not found' }, 404)
})

export default app
