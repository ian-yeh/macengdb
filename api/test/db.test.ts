// Needs the local Postgres from README (docker + migrations/0000_baseline.sql).
import { env, exports } from 'cloudflare:workers'
import postgres from 'postgres'
import { afterAll, beforeEach, describe, expect, it } from 'vitest'

type Json = any

const sql = postgres(env.HYPERDRIVE.connectionString)

let ip = 0
const call = async (method: string, path: string, body?: unknown, admin = false) => {
  const headers: Record<string, string> = { 'cf-connecting-ip': `10.9.${(ip >> 8) & 255}.${ip++ & 255}` }
  if (admin) headers['x-admin-key'] = 'test-key'
  if (body !== undefined) headers['content-type'] = 'application/json'
  const res = await exports.default.fetch(`http://api.test${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  return { status: res.status, body: (await res.json()) as Json }
}
const get = (path: string) => call('GET', path)
const adm = (method: string, path: string, body?: unknown) => call(method, path, body, true)

const DT = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(\.\d{6})?$/
const keys = (o: object) => Object.keys(o).sort()

const COMPANY = ['avg_difficulty', 'created_at', 'experience_count', 'id', 'industries', 'name', 'rating', 'updated_at']
const EXP = [
  'company_id', 'company_name', 'created_at', 'difficulty', 'id', 'interview_acquisition', 'new_company_name',
  'offer_received', 'position', 'stages', 'status', 'term', 'tips', 'updated_at',
]
const EXP_ADMIN = [...EXP, 'submitter_email', 'user_id'].sort()
const TEAM = ['avg_difficulty', 'categories', 'created_at', 'description', 'id', 'name', 'review_count', 'updated_at', 'website_url']
const REVIEW = [
  'accepted', 'created_at', 'description', 'design_team_id', 'design_team_name', 'difficulty', 'id',
  'interview_acquisition', 'position', 'status', 'term', 'tips', 'updated_at',
]
const REVIEW_ADMIN = [...REVIEW, 'submitter_email'].sort()
const REQUEST = ['created_at', 'id', 'name', 'requester_email', 'status']

const company = async (body: object = { name: 'Acme', industries: ['Software'] }) =>
  (await adm('POST', '/api/admin/companies', body)).body
const experience = async (company_id: number | null, extra: object = {}) =>
  (
    await call('POST', '/api/experiences/submit', {
      submitter_email: ' Foo@McMaster.ca ',
      company_id,
      position: 'SWE',
      term: 'F25',
      difficulty: 3,
      stages: [{ name: 'OA' }],
      ...extra,
    })
  ).body
const team = async (name = 'Rocketry', categories = ['Aero']) => {
  const req = (await call('POST', '/api/design-team-requests', { name })).body
  return (await adm('PATCH', `/api/admin/design-team-requests/${req.id}/approve`, { categories })).body
}
const review = (teamId: number, difficulty = 3) =>
  call('POST', `/api/design-teams/${teamId}/reviews`, {
    submitter_email: 'A@mcmaster.ca',
    design_team_id: 0,
    position: 'Mech',
    term: 'F25',
    difficulty,
  })

const truncate = () =>
  sql`TRUNCATE experiences, companies, company_requests, design_team_reviews, design_teams, design_team_requests RESTART IDENTITY CASCADE`
beforeEach(truncate)
afterAll(truncate)

describe('serialization', () => {
  it('formats naive timestamps like pydantic', async () => {
    await sql`INSERT INTO companies (name, industries, rating, created_at, updated_at)
      VALUES ('A', '{}', 4, '2025-01-02 03:04:05', '2025-01-02 03:04:05.4'),
             ('B', '{}', 4, '2025-01-02 03:04:05.00012', '2025-01-02 03:04:05.123456')`
    const [a, b] = (await get('/api/companies')).body
    expect(a.created_at).toBe('2025-01-02T03:04:05')
    expect(a.updated_at).toBe('2025-01-02T03:04:05.400000')
    expect(b.created_at).toBe('2025-01-02T03:04:05.000120')
    expect(b.updated_at).toBe('2025-01-02T03:04:05.123456')
    expect(a.rating).toBe(4)
    expect(a.industries).toEqual([])
  })

  it('normalizes stored stages', async () => {
    const c = await company()
    await sql`INSERT INTO experiences (company_id, submitter_email, position, term, offer_received, difficulty, stages, status, created_at, updated_at)
      VALUES (${c.id}, 'a@mcmaster.ca', 'p', 't', true, 2, ${sql.json([{ name: 'OA', extra: 1 }])}, 'approved', now(), now())`
    const [e] = (await get(`/api/companies/${c.id}/experiences`)).body
    expect(e.stages).toEqual([{ name: 'OA', duration: null, questions: [] }])
  })
})

describe('companies', () => {
  it('creates via admin', async () => {
    const { status, body } = await adm('POST', '/api/admin/companies', { name: 'Acme', industries: ['Software'] })
    expect(status).toBe(200)
    expect(keys(body)).toEqual(COMPANY)
    expect(body).toMatchObject({ name: 'Acme', industries: ['Software'], rating: 0, experience_count: 0 })
    expect(body.created_at).toMatch(DT)
    expect((await adm('POST', '/api/admin/companies', { industries: [] })).status).toBe(422)
    expect((await adm('POST', '/api/admin/companies', { name: 'x'.repeat(256) })).status).toBe(422)
  })

  it('lists with filters', async () => {
    const a = await company({ name: 'Acme', industries: ['Software'], rating: 4 })
    const b = await company({ name: 'Bolt', industries: ['Hardware'], rating: 2 })
    const e = await experience(a.id, { offer_received: true, position: 'Backend Engineer' })
    await adm('PATCH', `/api/admin/experiences/${e.id}/approve`)
    await experience(b.id, { offer_received: true })

    const names = async (q: string) => (await get(`/api/companies${q}`)).body.map((c: Json) => c.name)
    expect(await names('')).toEqual(['Acme', 'Bolt'])
    expect(await names('?industry=Software')).toEqual(['Acme'])
    expect(await names('?industry=')).toEqual(['Acme', 'Bolt'])
    expect(await names('?min_rating=3')).toEqual(['Acme'])
    expect(await names('?min_rating=0')).toEqual(['Acme', 'Bolt'])
    expect(await names('?has_offer=true')).toEqual(['Acme'])
    expect(await names('?has_offer=false')).toEqual(['Acme', 'Bolt'])
    expect(await names('?position=engineer')).toEqual(['Acme'])
    expect(await names('?search=zzz')).toEqual(['Acme', 'Bolt'])
    expect((await get('/api/companies')).body[0].experience_count).toBe(1)
    expect((await get('/api/companies')).body.map((c: Json) => c.avg_difficulty)).toEqual([3, null])
  })

  it('searches by name', async () => {
    await company({ name: 'Acme' })
    await company({ name: 'Bolt' })
    expect((await get('/api/companies/search?q=ac')).body.map((c: Json) => c.name)).toEqual(['Acme'])
    expect((await get('/api/companies/search?q=%20')).body).toHaveLength(2)
    expect((await get('/api/companies/search')).body).toHaveLength(2)
  })

  it('gets one with the real experience_count', async () => {
    const c = await company()
    const e = await experience(c.id)
    await adm('PATCH', `/api/admin/experiences/${e.id}/approve`)
    const { body } = await get(`/api/companies/${c.id}`)
    expect(keys(body)).toEqual(COMPANY)
    expect(body.experience_count).toBe(1)
    expect(await get('/api/companies/999999')).toEqual({ status: 404, body: { detail: 'Company not found' } })
  })

  it('patches only present keys and bumps updated_at', async () => {
    const c = await company()
    await sql`UPDATE companies SET updated_at = '2020-01-01' WHERE id = ${c.id}`
    const { body } = await adm('PATCH', `/api/admin/companies/${c.id}`, { rating: 4.5 })
    expect(body).toMatchObject({ name: 'Acme', industries: ['Software'], rating: 4.5, experience_count: 0 })
    expect(body.updated_at > '2020-01-01T00:00:00').toBe(true)
    expect((await adm('PATCH', `/api/admin/companies/${c.id}`, { industries: [] })).body.industries).toEqual([])
    expect((await adm('PATCH', `/api/admin/companies/${c.id}`, {})).status).toBe(200)
    expect((await adm('PATCH', `/api/admin/companies/${c.id}`, { name: null })).status).toBe(422)
    expect(await adm('PATCH', '/api/admin/companies/999999', { rating: 1 })).toEqual({ status: 404, body: { detail: 'Company not found' } })
  })

  it('deletes with its experiences', async () => {
    const c = await company()
    await experience(c.id)
    expect((await adm('DELETE', `/api/admin/companies/${c.id}`)).body).toEqual({ detail: 'Company deleted' })
    expect((await sql`SELECT count(*)::int AS n FROM experiences`)[0].n).toBe(0)
    expect(await adm('DELETE', `/api/admin/companies/${c.id}`)).toEqual({ status: 404, body: { detail: 'Company not found' } })
  })
})

describe('experiences', () => {
  it('submits anonymously as pending without private fields', async () => {
    const c = await company()
    const { status, body } = await call('POST', '/api/experiences/submit', {
      submitter_email: ' Foo@McMaster.ca ',
      company_id: c.id,
      position: 'SWE',
      term: 'F25',
      difficulty: 3,
      stages: [{ name: 'OA' }],
    })
    expect(status).toBe(200)
    expect(keys(body)).toEqual(EXP)
    expect(body).toMatchObject({ company_name: 'Acme', status: 'pending', offer_received: false, tips: null })
    expect(body.stages).toEqual([{ name: 'OA', duration: null, questions: [] }])
    const [row] = await sql`SELECT submitter_email, user_id, stages FROM experiences WHERE id = ${body.id}`
    expect(row.submitter_email).toBe('foo@mcmaster.ca')
    expect(row.user_id).toBeNull()
    expect(row.stages).toEqual([{ name: 'OA', duration: null, questions: [] }])
  })

  it('lists recent approved experiences with a company, newest first', async () => {
    const c = await company()
    const a = await experience(c.id, { position: 'A' })
    const b = await experience(c.id, { position: 'B' })
    await experience(c.id, { position: 'pending' })
    const orphan = await experience(null, { new_company_name: 'NewCo' })
    for (const e of [a, b, orphan]) await adm('PATCH', `/api/admin/experiences/${e.id}/approve`)
    await sql`UPDATE experiences SET created_at = created_at - interval '1 day' WHERE id = ${a.id}`
    const { body } = await get('/api/experiences/recent')
    expect(body.map((e: Json) => e.position)).toEqual(['B', 'A'])
    expect(keys(body[0])).toEqual(EXP)
  })

  it('accepts a new company name without company_id', async () => {
    const body = await experience(null, { new_company_name: 'NewCo' })
    expect(body).toMatchObject({ company_id: null, company_name: null, new_company_name: 'NewCo' })
  })

  it('returns 400 for a company_id that does not exist', async () => {
    const res = await call('POST', '/api/experiences/submit', {
      submitter_email: 'a@mcmaster.ca',
      company_id: 999999,
      position: 'SWE',
      term: 'F25',
      difficulty: 3,
    })
    expect(res).toEqual({ status: 400, body: { detail: 'Company not found' } })
  })

  it('validates email and difficulty', async () => {
    const res = await call('POST', '/api/experiences/submit', { submitter_email: 'a@gmail.com', position: 'x', term: 'x', difficulty: 3 })
    expect(res.status).toBe(422)
    expect(res.body.detail[0].msg).toContain('McMaster')
    expect((await call('POST', '/api/experiences/submit', { submitter_email: 'a@mcmaster.ca', position: 'x', term: 'x', difficulty: 0 })).status).toBe(422)
  })

  it('lists only approved experiences per company', async () => {
    const c = await company()
    const e = await experience(c.id)
    await experience(c.id)
    expect((await get(`/api/companies/${c.id}/experiences`)).body).toEqual([])
    await adm('PATCH', `/api/admin/experiences/${e.id}/approve`)
    const list = (await get(`/api/companies/${c.id}/experiences`)).body
    expect(list).toHaveLength(1)
    expect(keys(list[0])).toEqual(EXP)
    expect((await get('/api/companies/999999/experiences')).body).toEqual([])
  })

  it('admin lists pending and all, newest first', async () => {
    const c = await company()
    const a = await experience(c.id)
    const b = await experience(c.id)
    await sql`UPDATE experiences SET created_at = created_at - interval '1 day' WHERE id = ${a.id}`
    await adm('PATCH', `/api/admin/experiences/${a.id}/reject`)
    const pending = (await adm('GET', '/api/admin/experiences/pending')).body
    expect(pending.map((e: Json) => e.id)).toEqual([b.id])
    expect(keys(pending[0])).toEqual(EXP_ADMIN)
    expect(pending[0].submitter_email).toBe('foo@mcmaster.ca')
    expect((await adm('GET', '/api/admin/experiences/all')).body.map((e: Json) => e.id)).toEqual([b.id, a.id])
  })

  it('approves and rejects', async () => {
    const e = await experience((await company()).id)
    const { body } = await adm('PATCH', `/api/admin/experiences/${e.id}/approve`)
    expect(keys(body)).toEqual(EXP_ADMIN)
    expect(body.status).toBe('approved')
    expect((await adm('PATCH', `/api/admin/experiences/${e.id}/reject`)).body.status).toBe('rejected')
    expect(await adm('PATCH', '/api/admin/experiences/999999/approve')).toEqual({ status: 404, body: { detail: 'Experience not found' } })
  })

  it('patches fields and strips unknown keys', async () => {
    const e = await experience((await company()).id)
    await sql`UPDATE experiences SET updated_at = '2020-01-01' WHERE id = ${e.id}`
    const { body } = await adm('PATCH', `/api/admin/experiences/${e.id}`, {
      tips: 'be calm',
      stages: [{ name: 'Tech', questions: ['q'] }],
      interview_acquisition: 'ignored',
    })
    expect(body).toMatchObject({ tips: 'be calm', position: 'SWE', interview_acquisition: null })
    expect(body.stages).toEqual([{ name: 'Tech', duration: null, questions: ['q'] }])
    expect(body.updated_at > '2020-01-01T00:00:00').toBe(true)
    expect((await adm('PATCH', `/api/admin/experiences/${e.id}`, { difficulty: 9 })).status).toBe(422)
    expect((await adm('PATCH', '/api/admin/experiences/999999', { tips: 'x' })).status).toBe(404)
  })

  it('deletes', async () => {
    const e = await experience((await company()).id)
    expect((await adm('DELETE', `/api/admin/experiences/${e.id}`)).body).toEqual({ detail: 'Experience deleted' })
    expect(await adm('DELETE', `/api/admin/experiences/${e.id}`)).toEqual({ status: 404, body: { detail: 'Experience not found' } })
  })
})

describe('company requests', () => {
  it('creates with trimming', async () => {
    const { body } = await call('POST', '/api/company-requests', { name: '  Foo  ' })
    expect(keys(body)).toEqual(REQUEST)
    expect(body).toMatchObject({ name: 'Foo', requester_email: null, status: 'pending' })
    expect((await call('POST', '/api/company-requests', { name: 'Bar', requester_email: ' x@y.com ' })).body.requester_email).toBe('x@y.com')
    expect((await call('POST', '/api/company-requests', { name: 'Baz', requester_email: '' })).body.requester_email).toBeNull()
    expect((await call('POST', '/api/company-requests', {})).status).toBe(422)
  })

  it('lists pending, renames, approves and rejects', async () => {
    const a = (await call('POST', '/api/company-requests', { name: 'Foo' })).body
    const b = (await call('POST', '/api/company-requests', { name: 'Bar' })).body
    const c = (await call('POST', '/api/company-requests', { name: 'Baz' })).body

    expect((await adm('PATCH', `/api/admin/company-requests/${a.id}`, { name: ' Fooo ' })).body.name).toBe('Fooo')
    expect((await adm('PATCH', '/api/admin/company-requests/999999', { name: 'x' })).status).toBe(404)

    const approved = await adm('PATCH', `/api/admin/company-requests/${a.id}/approve`)
    expect(keys(approved.body)).toEqual(COMPANY)
    expect(approved.body).toMatchObject({ name: 'Fooo', industries: [], rating: 0, experience_count: 0 })
    expect((await get(`/api/companies/${approved.body.id}`)).status).toBe(200)
    const withIndustries = await adm('PATCH', `/api/admin/company-requests/${b.id}/approve`, { industries: ['Software'] })
    expect(withIndustries.body.industries).toEqual(['Software'])
    expect((await adm('PATCH', '/api/admin/company-requests/999999/approve')).status).toBe(404)

    expect((await adm('GET', '/api/admin/company-requests')).body.map((r: Json) => r.id)).toEqual([c.id])

    expect((await adm('DELETE', `/api/admin/company-requests/${c.id}`)).body).toEqual({ detail: 'Request rejected' })
    expect((await sql`SELECT status FROM company_requests WHERE id = ${c.id}`)[0].status).toBe('rejected')
    expect((await adm('DELETE', '/api/admin/company-requests/999999')).status).toBe(404)
  })

  it('bulk rejects', async () => {
    const a = (await call('POST', '/api/company-requests', { name: 'A' })).body
    const b = (await call('POST', '/api/company-requests', { name: 'B' })).body
    expect((await adm('POST', '/api/admin/company-requests/bulk-reject', [a.id, b.id])).body).toEqual({ detail: 'Rejected 2 requests' })
    expect((await adm('POST', '/api/admin/company-requests/bulk-reject', [])).body).toEqual({ detail: 'Rejected 0 requests' })
    expect((await adm('POST', '/api/admin/company-requests/bulk-reject', { x: 1 })).status).toBe(422)
  })
})

it('bulk reject rejects ids beyond int4 with 422', async () => {
  expect((await adm('POST', '/api/admin/company-requests/bulk-reject', [99999999999])).status).toBe(422)
  expect((await adm('POST', '/api/admin/design-team-requests/bulk-reject', [0])).status).toBe(422)
})

describe('design teams', () => {
  it('approving a request creates a team', async () => {
    const t = await team()
    expect(keys(t)).toEqual(TEAM)
    expect(t).toMatchObject({ name: 'Rocketry', categories: ['Aero'], review_count: 0, avg_difficulty: null, description: null })
    expect((await get(`/api/design-teams/${t.id}`)).status).toBe(200)
    expect(await get('/api/design-teams/999999')).toEqual({ status: 404, body: { detail: 'Design team not found' } })
  })

  it('submits reviews (201, path id wins)', async () => {
    const t = await team()
    const { status, body } = await review(t.id)
    expect(status).toBe(201)
    expect(keys(body)).toEqual(REVIEW)
    expect(body).toMatchObject({ design_team_id: t.id, design_team_name: 'Rocketry', status: 'pending', accepted: false })
    expect((await sql`SELECT submitter_email FROM design_team_reviews WHERE id = ${body.id}`)[0].submitter_email).toBe('a@mcmaster.ca')
    expect(await review(999999)).toEqual({ status: 404, body: { detail: 'Design team not found' } })
  })

  it('averages approved difficulty half-even and orders the list', async () => {
    const a = await team('Rocketry', ['Aero'])
    await team('Baja', ['Auto'])
    await team('Aardvark', ['Auto'])
    for (const d of [2, 2, 2, 3]) {
      const r = (await review(a.id, d)).body
      await adm('PATCH', `/api/admin/design-team-reviews/${r.id}/approve`)
    }
    await review(a.id, 5)
    const t = (await get(`/api/design-teams/${a.id}`)).body
    expect(t.review_count).toBe(4)
    expect(t.avg_difficulty).toBe(2.2)
    expect((await get('/api/design-teams')).body.map((x: Json) => x.name)).toEqual(['Rocketry', 'Aardvark', 'Baja'])
    expect((await get('/api/design-teams?category=Auto')).body.map((x: Json) => x.name)).toEqual(['Aardvark', 'Baja'])
    const reviews = (await get(`/api/design-teams/${a.id}/reviews`)).body
    expect(reviews).toHaveLength(4)
    expect(keys(reviews[0])).toEqual(REVIEW)
    expect(await get('/api/design-teams/999999/reviews')).toEqual({ status: 404, body: { detail: 'Design team not found' } })
  })

  it('patches a team with real counts', async () => {
    const t = await team()
    const r = (await review(t.id, 4)).body
    await adm('PATCH', `/api/admin/design-team-reviews/${r.id}/approve`)
    const { body } = await adm('PATCH', `/api/admin/design-teams/${t.id}`, { description: 'd', categories: ['Space'], website_url: null })
    expect(body).toMatchObject({ description: 'd', categories: ['Space'], review_count: 1, avg_difficulty: 4 })
    expect((await adm('PATCH', `/api/admin/design-teams/${t.id}`, { name: null })).status).toBe(422)
    expect((await adm('PATCH', '/api/admin/design-teams/999999', { name: 'x' })).status).toBe(404)
  })

  it('deletes a team with its reviews', async () => {
    const t = await team()
    await review(t.id)
    expect((await adm('DELETE', `/api/admin/design-teams/${t.id}`)).body).toEqual({ detail: 'Design team deleted' })
    expect((await sql`SELECT count(*)::int AS n FROM design_team_reviews WHERE design_team_id = ${t.id}`)[0].n).toBe(0)
    expect((await adm('DELETE', `/api/admin/design-teams/${t.id}`)).status).toBe(404)
  })
})

describe('design team reviews (admin)', () => {
  it('lists, approves, rejects, patches and deletes', async () => {
    const t = await team()
    const a = (await review(t.id)).body
    const b = (await review(t.id)).body
    await sql`UPDATE design_team_reviews SET created_at = created_at - interval '1 day' WHERE id = ${a.id}`

    const pending = (await adm('GET', '/api/admin/design-team-reviews')).body
    expect(pending.map((r: Json) => r.id)).toEqual([b.id, a.id])
    expect(keys(pending[0])).toEqual(REVIEW_ADMIN)

    const approved = await adm('PATCH', `/api/admin/design-team-reviews/${a.id}/approve`)
    expect(keys(approved.body)).toEqual(REVIEW_ADMIN)
    expect(approved.body.status).toBe('approved')
    expect((await adm('PATCH', `/api/admin/design-team-reviews/${b.id}/reject`)).body.status).toBe('rejected')
    expect((await adm('GET', '/api/admin/design-team-reviews')).body).toEqual([])
    expect((await adm('GET', '/api/admin/design-team-reviews/all')).body.map((r: Json) => r.id)).toEqual([b.id, a.id])
    expect((await adm('PATCH', '/api/admin/design-team-reviews/999999/approve')).status).toBe(404)

    const patched = await adm('PATCH', `/api/admin/design-team-reviews/${a.id}`, { tips: 'x', accepted: true, interview_acquisition: 'ignored' })
    expect(patched.body).toMatchObject({ tips: 'x', accepted: true, interview_acquisition: null })
    expect((await adm('PATCH', `/api/admin/design-team-reviews/${a.id}`, { difficulty: 0 })).status).toBe(422)
    expect(await adm('PATCH', '/api/admin/design-team-reviews/999999', { tips: 'x' })).toEqual({ status: 404, body: { detail: 'Review not found' } })

    expect((await adm('DELETE', `/api/admin/design-team-reviews/${a.id}`)).body).toEqual({ detail: 'Review deleted' })
    expect((await adm('DELETE', `/api/admin/design-team-reviews/${a.id}`)).status).toBe(404)
  })
})

describe('design team requests', () => {
  it('creates, lists, renames, rejects and bulk rejects', async () => {
    const a = (await call('POST', '/api/design-team-requests', { name: '  Foo  ' })).body
    expect(keys(a)).toEqual(REQUEST)
    expect(a).toMatchObject({ name: 'Foo', requester_email: null, status: 'pending' })
    const b = (await call('POST', '/api/design-team-requests', { name: 'Bar' })).body
    const c = (await call('POST', '/api/design-team-requests', { name: 'Baz' })).body

    expect((await adm('PATCH', `/api/admin/design-team-requests/${a.id}`, { name: ' Fooo ' })).body.name).toBe('Fooo')
    expect((await adm('PATCH', '/api/admin/design-team-requests/999999', { name: 'x' })).status).toBe(404)

    const approved = await adm('PATCH', `/api/admin/design-team-requests/${a.id}/approve`)
    expect(approved.body).toMatchObject({ name: 'Fooo', categories: [], review_count: 0, avg_difficulty: null })
    expect((await adm('PATCH', '/api/admin/design-team-requests/999999/approve')).status).toBe(404)
    expect((await adm('GET', '/api/admin/design-team-requests')).body.map((r: Json) => r.id).sort()).toEqual([b.id, c.id])

    expect((await adm('DELETE', `/api/admin/design-team-requests/${b.id}`)).body).toEqual({ detail: 'Request rejected' })
    expect((await sql`SELECT status FROM design_team_requests WHERE id = ${b.id}`)[0].status).toBe('rejected')
    expect((await adm('DELETE', '/api/admin/design-team-requests/999999')).status).toBe(404)

    expect((await adm('POST', '/api/admin/design-team-requests/bulk-reject', [b.id, c.id])).body).toEqual({ detail: 'Rejected 2 requests' })
    expect((await adm('POST', '/api/admin/design-team-requests/bulk-reject', 'x')).status).toBe(422)
  })
})
