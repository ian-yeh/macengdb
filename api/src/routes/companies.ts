import { Hono } from 'hono'
import type postgres from 'postgres'
import { z } from 'zod'
import { NOW, patch, validate, type AppEnv } from '../db'

const company = (sql: postgres.Sql) => sql`
  SELECT c.id, c.name, c.industries, c.rating, c.created_at, c.updated_at,
    (SELECT count(*)::int FROM experiences e WHERE e.company_id = c.id AND e.status = 'approved') AS experience_count
  FROM companies c`

const filters = z.object({
  industry: z.string().optional(),
  min_rating: z.coerce.number().optional(),
  has_offer: z.stringbool().optional(),
  position: z.string().optional(),
})

const list = (sql: postgres.Sql, f: z.infer<typeof filters> = {}) => sql`
  ${company(sql)} WHERE true
  ${f.industry ? sql`AND ${f.industry} = ANY(c.industries)` : sql``}
  ${f.min_rating ? sql`AND c.rating >= ${f.min_rating}` : sql``}
  ${f.has_offer ? sql`AND EXISTS (SELECT 1 FROM experiences e WHERE e.company_id = c.id AND e.status = 'approved' AND e.offer_received)` : sql``}
  ${f.position ? sql`AND EXISTS (SELECT 1 FROM experiences e WHERE e.company_id = c.id AND e.status = 'approved' AND e.position ILIKE ${'%' + f.position + '%'})` : sql``}
  ORDER BY c.id`

const name = z.string().max(255)
const industries = z.array(z.string().max(100))

const app = new Hono<AppEnv>()

app.get('/companies', validate('query', filters), async (c) => c.json(await list(c.var.sql, c.req.valid('query'))))

app.get('/companies/search', async (c) => {
  const sql = c.var.sql
  const q = c.req.query('q') ?? ''
  if (!q.trim()) return c.json(await list(sql))
  return c.json(await sql`${company(sql)} WHERE c.name ILIKE ${'%' + q + '%'} ORDER BY c.id LIMIT 10`)
})

app.get('/companies/:id{[0-9]+}', async (c) => {
  const sql = c.var.sql
  const [row] = await sql`${company(sql)} WHERE c.id = ${c.req.param('id')}`
  return row ? c.json(row) : c.json({ detail: 'Company not found' }, 404)
})

app.post(
  '/admin/companies',
  validate('json', z.object({ name, industries: industries.default([]), rating: z.number().default(0) })),
  async (c) => {
    const sql = c.var.sql
    const b = c.req.valid('json')
    const [row] = await sql`
      INSERT INTO companies (name, industries, rating, created_at, updated_at)
      VALUES (${b.name}, ${b.industries}::varchar[], ${b.rating}, ${sql.unsafe(NOW)}, ${sql.unsafe(NOW)})
      RETURNING id, name, industries, rating, created_at, updated_at, 0 AS experience_count`
    return c.json(row)
  },
)

app.patch(
  '/admin/companies/:id{[0-9]+}',
  validate('json', z.object({ name: name.optional(), industries: industries.optional(), rating: z.number().optional() })),
  async (c) => {
    const sql = c.var.sql
    const b = c.req.valid('json')
    const [row] = await sql`
      WITH u AS (UPDATE companies SET ${patch(sql, b)} WHERE id = ${c.req.param('id')} RETURNING *)
      SELECT u.id, u.name, u.industries, u.rating, u.created_at, u.updated_at,
        (SELECT count(*)::int FROM experiences e WHERE e.company_id = u.id AND e.status = 'approved') AS experience_count
      FROM u`
    return row ? c.json(row) : c.json({ detail: 'Company not found' }, 404)
  },
)

app.delete('/admin/companies/:id{[0-9]+}', async (c) => {
  const id = c.req.param('id')
  const rows = await c.var.sql.begin(async (tx) => {
    await tx`DELETE FROM experiences WHERE company_id = ${id}`
    return tx`DELETE FROM companies WHERE id = ${id} RETURNING id`
  })
  return rows.length ? c.json({ detail: 'Company deleted' }) : c.json({ detail: 'Company not found' }, 404)
})

export default app
