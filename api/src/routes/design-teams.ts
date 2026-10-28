import { Hono } from 'hono'
import type postgres from 'postgres'
import { z } from 'zod'
import { NOW, difficulty, email, limit, optionalJson, patch, validate, type AppEnv } from '../db'
import { requests } from './company-requests'

const team = (sql: postgres.Sql, where = sql``) => sql`
  SELECT t.id, t.name, t.description, t.categories, t.website_url, t.created_at, t.updated_at,
    count(r.id) FILTER (WHERE r.status = 'approved')::int AS review_count,
    round((avg(r.difficulty) FILTER (WHERE r.status = 'approved') * 10)::float8) / 10 AS avg_difficulty
  FROM design_teams t LEFT JOIN design_team_reviews r ON r.design_team_id = t.id
  ${where} GROUP BY t.id`

// FROM <src> x, joined to its team; admin adds submitter_email
const review = (sql: postgres.Sql, admin: boolean, src = sql`design_team_reviews`) => sql`
  SELECT x.id, x.design_team_id, dt.name AS design_team_name, x.position, x.term, x.accepted, x.difficulty,
    x.description, x.tips, x.interview_acquisition, x.status, x.created_at, x.updated_at
    ${admin ? sql`, x.submitter_email` : sql``}
  FROM ${src} x LEFT JOIN design_teams dt ON dt.id = x.design_team_id`

const submit = z.object({
  submitter_email: email,
  position: z.string().max(255),
  term: z.string().max(50),
  accepted: z.boolean().default(false),
  difficulty,
  description: z.string().nullish(),
  tips: z.string().nullish(),
  interview_acquisition: z.string().max(500).nullish(),
})

const teamUpdate = z.object({
  name: z.string().max(255).optional(),
  description: z.string().nullish(),
  categories: z.array(z.string().max(100)).optional(),
  website_url: z.string().max(500).nullish(),
})

const reviewUpdate = z.object({
  position: z.string().max(255).optional(),
  term: z.string().max(50).optional(),
  accepted: z.boolean().optional(),
  difficulty: difficulty.optional(),
  description: z.string().nullish(),
  tips: z.string().nullish(),
})

const NO_TEAM = { detail: 'Design team not found' }
const NO_REVIEW = { detail: 'Review not found' }

const app = new Hono<AppEnv>()

app.get('/design-teams', validate('query', z.object({ category: z.string().optional() })), async (c) => {
  const sql = c.var.sql
  const { category } = c.req.valid('query')
  return c.json(await sql`${team(sql, category ? sql`WHERE ${category} = ANY(t.categories)` : sql``)} ORDER BY review_count DESC, t.name`)
})

app.get('/design-teams/:id{[0-9]{1,9}}', async (c) => {
  const sql = c.var.sql
  const [row] = await team(sql, sql`WHERE t.id = ${c.req.param('id')}`)
  return row ? c.json(row) : c.json(NO_TEAM, 404)
})

app.get('/design-teams/:id{[0-9]{1,9}}/reviews', async (c) => {
  const sql = c.var.sql
  const id = c.req.param('id')
  if (!(await sql`SELECT 1 FROM design_teams WHERE id = ${id}`).length) return c.json(NO_TEAM, 404)
  return c.json(await sql`${review(sql, false)} WHERE x.design_team_id = ${id} AND x.status = 'approved' ORDER BY x.created_at DESC`)
})

app.post('/design-teams/:id{[0-9]{1,9}}/reviews', limit('REVIEW_LIMITER'), validate('json', submit), async (c) => {
  const sql = c.var.sql
  const b = c.req.valid('json')
  const [row] = await sql`
    WITH x AS (
      INSERT INTO design_team_reviews (design_team_id, submitter_email, position, term, accepted, difficulty,
        description, tips, interview_acquisition, status, created_at, updated_at)
      SELECT t.id, ${b.submitter_email}, ${b.position}, ${b.term}, ${b.accepted}, ${b.difficulty}, ${b.description ?? null},
        ${b.tips ?? null}, ${b.interview_acquisition ?? null}, 'pending', ${sql.unsafe(NOW)}, ${sql.unsafe(NOW)}
      FROM design_teams t WHERE t.id = ${c.req.param('id')}
      RETURNING *)
    ${review(sql, false, sql`x`)}`
  return row ? c.json(row, 201) : c.json(NO_TEAM, 404)
})

app.patch('/admin/design-teams/:id{[0-9]{1,9}}', validate('json', teamUpdate), async (c) => {
  const sql = c.var.sql
  const id = c.req.param('id')
  if (!(await sql`UPDATE design_teams SET ${patch(sql, c.req.valid('json'))} WHERE id = ${id} RETURNING id`).length)
    return c.json(NO_TEAM, 404)
  const [row] = await team(sql, sql`WHERE t.id = ${id}`)
  return c.json(row)
})

app.delete('/admin/design-teams/:id{[0-9]{1,9}}', async (c) => {
  const id = c.req.param('id')
  const rows = await c.var.sql.begin(async (tx) => {
    await tx`DELETE FROM design_team_reviews WHERE design_team_id = ${id}`
    return tx`DELETE FROM design_teams WHERE id = ${id} RETURNING id`
  })
  return rows.length ? c.json({ detail: 'Design team deleted' }) : c.json(NO_TEAM, 404)
})

app.get('/admin/design-team-reviews', async (c) => {
  const sql = c.var.sql
  return c.json(await sql`${review(sql, true)} WHERE x.status = 'pending' ORDER BY x.created_at DESC`)
})

app.get('/admin/design-team-reviews/all', async (c) => {
  const sql = c.var.sql
  return c.json(await sql`${review(sql, true)} ORDER BY x.created_at DESC`)
})

for (const [action, status] of [['approve', 'approved'], ['reject', 'rejected']]) {
  app.patch(`/admin/design-team-reviews/:id{[0-9]{1,9}}/${action}`, async (c) => {
    const sql = c.var.sql
    const [row] = await sql`
      WITH x AS (UPDATE design_team_reviews SET status = ${status}, updated_at = ${sql.unsafe(NOW)}
        WHERE id = ${c.req.param('id')} RETURNING *)
      ${review(sql, true, sql`x`)}`
    return row ? c.json(row) : c.json(NO_REVIEW, 404)
  })
}

app.patch('/admin/design-team-reviews/:id{[0-9]{1,9}}', validate('json', reviewUpdate), async (c) => {
  const sql = c.var.sql
  const [row] = await sql`
    WITH x AS (UPDATE design_team_reviews SET ${patch(sql, c.req.valid('json'))} WHERE id = ${c.req.param('id')} RETURNING *)
    ${review(sql, true, sql`x`)}`
  return row ? c.json(row) : c.json(NO_REVIEW, 404)
})

app.delete('/admin/design-team-reviews/:id{[0-9]{1,9}}', async (c) => {
  const rows = await c.var.sql`DELETE FROM design_team_reviews WHERE id = ${c.req.param('id')} RETURNING id`
  return rows.length ? c.json({ detail: 'Review deleted' }) : c.json(NO_REVIEW, 404)
})

requests(app, 'design-team-requests', 'DESIGN_TEAM_REQUEST_LIMITER')

app.patch('/admin/design-team-requests/:id{[0-9]{1,9}}/approve', async (c) => {
  const { bad, data } = await optionalJson(c, z.object({ categories: z.array(z.string().max(100)).default([]) }))
  if (bad) return bad
  const id = c.req.param('id')
  const row = await c.var.sql.begin(async (tx) => {
    const [req] = await tx`SELECT name FROM design_team_requests WHERE id = ${id} FOR UPDATE`
    if (!req) return
    const [t] = await tx`
      INSERT INTO design_teams (name, description, categories, website_url, created_at, updated_at)
      VALUES (${req.name}, NULL, ${data.categories}::varchar[], NULL, ${tx.unsafe(NOW)}, ${tx.unsafe(NOW)})
      RETURNING id, name, description, categories, website_url, created_at, updated_at,
        0 AS review_count, NULL::float8 AS avg_difficulty`
    await tx`UPDATE design_team_requests SET status = 'approved' WHERE id = ${id}`
    return t
  })
  return row ? c.json(row) : c.json({ detail: 'Request not found' }, 404)
})

export default app
