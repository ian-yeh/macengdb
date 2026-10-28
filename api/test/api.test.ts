import { exports } from 'cloudflare:workers'
import { describe, expect, it } from 'vitest'

const get = (path: string, headers: Record<string, string> = {}) => exports.default.fetch(`http://api.test${path}`, { headers })
const post = (path: string, body: unknown, headers: Record<string, string> = {}) =>
  exports.default.fetch(`http://api.test${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
  })

describe('basics', () => {
  it('serves root and health', async () => {
    expect(await (await get('/')).json()).toBe('MacEng Course Database API')
    expect(await (await get('/health')).json()).toEqual({ status: 'healthy' })
  })

  it('returns JSON 404s, including non-numeric ids and the dropped public POST /api/companies', async () => {
    for (const res of [await get('/nope'), await get('/api/companies/abc'), await post('/api/companies', { name: 'x' })]) {
      expect(res.status).toBe(404)
      expect(await res.json()).toEqual({ detail: 'Not Found' })
    }
  })
})

describe('cors', () => {
  const acao = async (origin: string) => (await get('/health', { origin })).headers.get('access-control-allow-origin')

  it('allows listed origins and vercel previews, denies others', async () => {
    expect(await acao('https://macengdb.ca')).toBe('https://macengdb.ca')
    expect(await acao('http://localhost:5173')).toBe('http://localhost:5173')
    expect(await acao('https://macengdb-git-x.vercel.app')).toBe('https://macengdb-git-x.vercel.app')
    expect(await acao('https://evil.com')).toBeNull()
    expect(await acao('https://macengdb-x.vercel.app.evil.com')).toBeNull()
  })

  it('answers preflight with credentials and reflected headers', async () => {
    const res = await exports.default.fetch('http://api.test/api/companies', {
      method: 'OPTIONS',
      headers: {
        origin: 'https://macengdb.ca',
        'access-control-request-method': 'PATCH',
        'access-control-request-headers': 'x-admin-key,content-type',
      },
    })
    expect(res.status).toBe(204)
    expect(res.headers.get('access-control-allow-headers')).toContain('x-admin-key')
    expect(res.headers.get('access-control-allow-credentials')).toBe('true')
  })
})

describe('admin auth', () => {
  it('rejects missing and wrong keys with 403', async () => {
    for (const headers of [{}, { 'x-admin-key': 'wrong' }, { 'x-admin-key': 'test-ke' }] as Record<string, string>[]) {
      const res = await get('/api/admin/experiences/pending', headers)
      expect(res.status).toBe(403)
      expect(await res.json()).toEqual({ detail: 'Invalid admin key' })
    }
  })

  it('checks the key before the body', async () => {
    expect((await post('/api/admin/companies', {}, { 'x-admin-key': 'wrong' })).status).toBe(403)
  })

  it('lets the right key through', async () => {
    const res = await get('/api/admin/x', { 'x-admin-key': 'test-key' })
    expect(res.status).toBe(404)
  })
})

describe('validation', () => {
  const ip = { 'cf-connecting-ip': '10.0.0.1' }

  it('returns the FastAPI 422 shape for body errors', async () => {
    const res = await post('/api/experiences/submit', { submitter_email: 'a@gmail.com', position: 'x', term: 'x', difficulty: 9 }, ip)
    expect(res.status).toBe(422)
    const { detail } = (await res.json()) as { detail: { loc: unknown[]; msg: string; type: string }[] }
    expect(detail).toContainEqual(expect.objectContaining({ loc: ['body', 'submitter_email'], msg: 'Must be a McMaster email address (@mcmaster.ca)' }))
    expect(detail).toContainEqual(expect.objectContaining({ loc: ['body', 'difficulty'], msg: 'Difficulty must be between 1 and 5' }))
  })

  it('returns 422 with loc query for bad query params', async () => {
    const res = await get('/api/companies?min_rating=abc')
    expect(res.status).toBe(422)
    const { detail } = (await res.json()) as { detail: { loc: unknown[]; msg: string }[] }
    expect(detail[0].loc).toEqual(['query', 'min_rating'])
    expect(detail[0].msg).toBeTypeOf('string')
    expect((await get('/api/companies?has_offer=maybe')).status).toBe(422)
  })
})

describe('rate limits run before validation', () => {
  const spam = async (path: string, n: number, ip: string) => {
    const codes = []
    for (let i = 0; i < n; i++) codes.push((await post(path, {}, { 'cf-connecting-ip': ip })).status)
    return codes
  }

  it('experience submit: 5/min', async () => {
    expect(await spam('/api/experiences/submit', 6, '10.1.0.1')).toEqual([422, 422, 422, 422, 422, 429])
  })

  it('design team review submit: 5/min', async () => {
    expect(await spam('/api/design-teams/1/reviews', 6, '10.1.0.2')).toEqual([422, 422, 422, 422, 422, 429])
  })

  it('company and design team requests: 3/min', async () => {
    expect(await spam('/api/company-requests', 4, '10.1.0.3')).toEqual([422, 422, 422, 429])
    expect(await spam('/api/design-team-requests', 4, '10.1.0.3')).toEqual([422, 422, 422, 429])
  })

  it('429 body', async () => {
    const res = await post('/api/company-requests', {}, { 'cf-connecting-ip': '10.1.0.3' })
    expect(await res.json()).toEqual({ detail: 'Rate limit exceeded' })
  })
})
