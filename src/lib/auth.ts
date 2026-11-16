import { redirect } from '@tanstack/react-router'
import { createMiddleware, createServerFn } from '@tanstack/react-start'
import { getCookie, getRequest } from '@tanstack/react-start/server'

const TOKEN_COOKIE = 'token'
const DEFAULT_BACKEND_URL = 'http://localhost:8000'

/** How long a validated session is reused on the client before re-checking. */
const SESSION_TTL = 30_000

/** Serializable shape of the signed-in user. */
export interface AuthUser {
  id: string | number | null
  name: string
  email: string
  role: string
  avatar: string | null
}

export interface AuthSession {
  user: AuthUser | null
}

/* -------------------------------------------------------------------------- */
/*                              Session lookup                                */
/* -------------------------------------------------------------------------- */

/**
 * Validate the token cookie against the backend.
 *
 * The token is mirrored into a non-httpOnly cookie when the user signs in
 * (see `setAuthToken` in `lib/axios.ts`), so the server can read it during
 * SSR and verify it. Browsers only ever send it back to our own origin, and
 * the backend is the only thing that decides whether it is still valid.
 */
async function fetchSession(): Promise<AuthSession> {
  const token = getCookie(TOKEN_COOKIE)
  if (!token) return { user: null }

  const backendUrl = (
    process.env.BACKEND_BASE_URL || DEFAULT_BACKEND_URL
  ).replace(/\/$/, '')
  const request = getRequest()

  try {
    const response = await fetch(
      `${backendUrl}/api/auth/login/refresh-credentials`,
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
          // Keep the backend session in sync as well.
          cookie: request.headers.get('cookie') ?? '',
        },
        cache: 'no-store',
      },
    )

    if (!response.ok) return { user: null }

    return { user: extractUser(await response.json()) }
  } catch {
    return { user: null }
  }
}

/* -------------------------------------------------------------------------- */
/*                              Auth middleware                               */
/* -------------------------------------------------------------------------- */

/**
 * Server function middleware that rejects unauthenticated calls.
 *
 * Attach it to every server function that reads or mutates private data:
 *
 *   const getSomething = createServerFn()
 *     .middleware([authMiddleware])
 *     .handler(({ context }) => {
 *       context.user // typed as AuthUser
 *     })
 */
export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const session = await fetchSession()

    if (!session.user) {
      throw redirect({ to: '/login' })
    }

    return next({ context: { user: session.user } })
  },
)

/* -------------------------------------------------------------------------- */
/*                              Session endpoint                              */
/* -------------------------------------------------------------------------- */

const getSessionFn = createServerFn({ method: 'GET' }).handler(
  (): Promise<AuthSession> => fetchSession(),
)

/**
 * Protected server function used by the sidebar to load the signed-in user.
 * The middleware guarantees `user` is present, so this throws (and redirects
 * to `/login`) instead of returning an empty profile when the token expired.
 */
export const getCurrentUser = createServerFn({ method: 'GET' })
  .middleware([authMiddleware])
  .handler(({ context }) => context.user)

/* -------------------------------------------------------------------------- */
/*                            Client-side session                             */
/* -------------------------------------------------------------------------- */

let cachedSession: { value: AuthSession; expiresAt: number } | null = null

/**
 * Read the current session.
 *
 * The result is cached briefly on the client so navigating between pages does
 * not hit the backend on every route change; a full page load always validates
 * again. Positive results only, so a fresh sign-in is picked up immediately.
 */
export async function getAuthSession(): Promise<AuthSession> {
  if (typeof window === 'undefined') return getSessionFn()

  if (cachedSession && cachedSession.expiresAt > Date.now()) {
    return cachedSession.value
  }

  const value = await getSessionFn()

  cachedSession = value.user
    ? { value, expiresAt: Date.now() + SESSION_TTL }
    : null

  return value
}

/** Drop the cached session after signing in or out. */
export function invalidateAuthSession() {
  cachedSession = null
}

/**
 * Route guard for protected routes.
 *
 *   export const Route = createFileRoute('/_app')({
 *     beforeLoad: requireAuth,
 *   })
 */
export async function requireAuth() {
  const session = await getAuthSession()

  if (!session.user) {
    throw redirect({ to: '/login' })
  }

  return { user: session.user }
}

/* -------------------------------------------------------------------------- */
/*                                  Helpers                                   */
/* -------------------------------------------------------------------------- */

function extractUser(payload: unknown): AuthUser | null {
  if (!isRecord(payload)) return null

  const candidates = [
    payload.serializeUser,
    payload.serilizedUser,
    payload.user,
    payload.profile,
    payload.data,
  ]

  for (const candidate of candidates) {
    if (isRecord(candidate) && looksLikeUser(candidate)) {
      return normalizeUser(candidate)
    }
  }

  if (looksLikeUser(payload)) return normalizeUser(payload)

  return null
}

function normalizeUser(value: Record<string, unknown>): AuthUser {
  return {
    id: asId(pick(value, 'id', 'ID', 'userId', 'UserID')),
    name: asString(
      pick(value, 'name', 'Name', 'Fullname', 'fullName', 'username'),
    ),
    email: asString(pick(value, 'email', 'Email')),
    role: asString(pick(value, 'role', 'Role', 'RoleDesc', 'roleName')),
    avatar:
      asString(pick(value, 'avatar', 'Avatar', 'avatarUrl', 'photo')) || null,
  }
}

function pick(value: Record<string, unknown>, ...keys: string[]) {
  for (const key of keys) {
    const candidate = value[key]
    if (candidate !== undefined && candidate !== null && candidate !== '') {
      return candidate
    }
  }
  return undefined
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function asId(value: unknown): string | number | null {
  if (typeof value === 'string' || typeof value === 'number') return value
  return null
}

function looksLikeUser(value: Record<string, unknown>) {
  return Boolean(
    value.id ||
    value.ID ||
    value.email ||
    value.Email ||
    value.name ||
    value.Fullname,
  )
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
