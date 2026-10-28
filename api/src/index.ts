import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { admin } from './admin'
import { db, type AppEnv } from './db'

declare global {
  namespace Cloudflare {
    interface Env {
      HYPERDRIVE: Hyperdrive
      ADMIN_SECRET_KEY: string
      EXPERIENCE_LIMITER: RateLimit
      COMPANY_REQUEST_LIMITER: RateLimit
      DESIGN_TEAM_REQUEST_LIMITER: RateLimit
      REVIEW_LIMITER: RateLimit
    }
  }
}

const ORIGINS = new Set([
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  'https://macengdb.ca',
  'https://www.macengdb.ca',
  'https://macengdb.ianyeh.ca',
  'https://www.macengdb.ianyeh.ca',
  'https://macengdb-api.ianyeh.ca',
])

const app = new Hono<AppEnv>()

app.use(
  cors({
    origin: (o) => (ORIGINS.has(o) || /^https:\/\/macengdb-.*\.vercel\.app$/.test(o) ? o : null),
    credentials: true,
  }),
)

app.get('/', (c) => c.json('MacEng Course Database API'))
app.get('/health', (c) => c.json({ status: 'healthy' }))

app.use('/api/*', db)
app.use('/api/admin/*', admin)

app.notFound((c) => c.json({ detail: 'Not Found' }, 404))
app.onError((err, c) => {
  if (err instanceof HTTPException) return c.json({ detail: err.message }, err.status)
  console.error(err)
  return c.json({ detail: 'Internal Server Error' }, 500)
})

export default app
