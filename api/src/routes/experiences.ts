import { Hono } from 'hono'
import type postgres from 'postgres'
import { z } from 'zod'
import { NOW, difficulty, email, limit, patch, validate, type AppEnv } from '../db'

type Stage = { name: string; duration?: string | null; questions?: string[] }

// FROM <src> x, joined to its company; admin adds the private columns
const select = (sql: postgres.Sql, admin: boolean, src = sql`experiences`) => sql`
  SELECT x.id, x.company_id, co.name AS company_name, x.new_company_name, x.position, x.term,
    x.offer_received, x.difficulty, x.stages, x.tips, x.interview_acquisition, x.status,
    x.created_at, x.updated_at ${admin ? sql`, x.user_id, x.submitter_email` : sql``}
  FROM ${src} x LEFT JOIN companies co ON co.id = x.company_id`

// legacy rows may hold partial stages; pydantic filled in the missing keys
const out = (rows: postgres.Row[]) =>
  rows.map((r) => ({
    ...r,
    stages: (r.stages as Stage[]).map((s) => ({ name: s.name, duration: s.duration ?? null, questions: s.questions ?? [] })),
  }))

const stages = z.array(
  z.object({
    name: z.string(),
    duration: z.string().nullable().default(null),
    questions: z.array(z.string()).default([]),
  }),
)

const submit = z.object({
  submitter_email: email,
  company_id: z.number().int().max(2147483647).nullish(),
  new_company_name: z.string().max(255).nullish(),
  position: z.string().max(255),
  term: z.string().max(50),
  offer_received: z.boolean().default(false),
  difficulty,
  stages: stages.default([]),
  tips: z.string().nullish(),
  interview_acquisition: z.string().max(255).nullish(),
})

const update = z.object({
  position: z.string().max(255).optional(),
  term: z.string().max(50).optional(),
  offer_received: z.boolean().optional(),
  difficulty: difficulty.optional(),
  stages: stages.optional(),
  tips: z.string().nullish(),
})

const app = new Hono<AppEnv>()

app.get('/companies/:id{[0-9]{1,9}}/experiences', async (c) => {
  const sql = c.var.sql
  const rows = await sql`${select(sql, false)} WHERE x.company_id = ${c.req.param('id')} AND x.status = 'approved' ORDER BY x.id`
  return c.json(out(rows))
})

app.get('/experiences/recent', async (c) => {
  const sql = c.var.sql
  return c.json(out(await sql`${select(sql, false)} WHERE x.status = 'approved' AND x.company_id IS NOT NULL ORDER BY x.created_at DESC LIMIT 8`))
})

app.post('/experiences/submit', limit('EXPERIENCE_LIMITER'), validate('json', submit), async (c) => {
  const sql = c.var.sql
  const b = c.req.valid('json')
  try {
    const rows = await sql`
      WITH x AS (
        INSERT INTO experiences (user_id, company_id, new_company_name, submitter_email, position, term,
          offer_received, difficulty, stages, tips, interview_acquisition, status, created_at, updated_at)
        VALUES (NULL, ${b.company_id ?? null}, ${b.new_company_name ?? null}, ${b.submitter_email}, ${b.position}, ${b.term},
          ${b.offer_received}, ${b.difficulty}, ${sql.json(b.stages)}, ${b.tips ?? null}, ${b.interview_acquisition ?? null},
          'pending', ${sql.unsafe(NOW)}, ${sql.unsafe(NOW)})
        RETURNING *)
      ${select(sql, false, sql`x`)}`
    return c.json(out(rows)[0])
  } catch (e) {
    if ((e as { code?: string }).code === '23503') return c.json({ detail: 'Company not found' }, 400)
    throw e
  }
})

app.get('/admin/experiences/pending', async (c) => {
  const sql = c.var.sql
  return c.json(out(await sql`${select(sql, true)} WHERE x.status = 'pending' ORDER BY x.created_at DESC`))
})

app.get('/admin/experiences/all', async (c) => {
  const sql = c.var.sql
  return c.json(out(await sql`${select(sql, true)} ORDER BY x.created_at DESC`))
})

for (const [action, status] of [['approve', 'approved'], ['reject', 'rejected']]) {
  app.patch(`/admin/experiences/:id{[0-9]{1,9}}/${action}`, async (c) => {
    const sql = c.var.sql
    const rows = await sql`
      WITH x AS (UPDATE experiences SET status = ${status}, updated_at = ${sql.unsafe(NOW)} WHERE id = ${c.req.param('id')} RETURNING *)
      ${select(sql, true, sql`x`)}`
    return rows.length ? c.json(out(rows)[0]) : c.json({ detail: 'Experience not found' }, 404)
  })
}

app.patch('/admin/experiences/:id{[0-9]{1,9}}', validate('json', update), async (c) => {
  const sql = c.var.sql
  const b = c.req.valid('json')
  const rows = await sql`
    WITH x AS (UPDATE experiences SET ${patch(sql, b.stages ? { ...b, stages: sql.json(b.stages) } : b)}
      WHERE id = ${c.req.param('id')} RETURNING *)
    ${select(sql, true, sql`x`)}`
  return rows.length ? c.json(out(rows)[0]) : c.json({ detail: 'Experience not found' }, 404)
})

app.delete('/admin/experiences/:id{[0-9]{1,9}}', async (c) => {
  const rows = await c.var.sql`DELETE FROM experiences WHERE id = ${c.req.param('id')} RETURNING id`
  return rows.length ? c.json({ detail: 'Experience deleted' }) : c.json({ detail: 'Experience not found' }, 404)
})

export default app
