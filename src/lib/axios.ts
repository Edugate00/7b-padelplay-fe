import axios from 'axios'
import type {
  AxiosError,
  AxiosInstance,
  InternalAxiosRequestConfig,
} from 'axios'

/* -------------------------------------------------------------------------- */
/*                                   Config                                   */
/* -------------------------------------------------------------------------- */

const BASE_URL =
  import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '/api'
const TOKEN_KEY = 'token'
const MUTATING_METHODS = ['post', 'put', 'patch', 'delete']

let csrfTokenCache: string | null = null // in-memory token cache

/* -------------------------------------------------------------------------- */
/*                                  Instances                                 */
/* -------------------------------------------------------------------------- */

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Plain instance without interceptors, used only to fetch the CSRF token
// (so the interceptor does not loop).
const rawAxios: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
})

/* -------------------------------------------------------------------------- */
/*                                    CSRF                                    */
/* -------------------------------------------------------------------------- */

async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await rawAxios.get('/csrf-token')
    // Access-Control-Expose-Headers: x-csrf-token
    const token =
      (res.headers['x-csrf-token'] as string | undefined) ??
      (typeof res.data === 'object' && res.data
        ? res.data['x-csrf-token'] || res.data['csrfToken'] || res.data['token']
        : null)
    if (token) csrfTokenCache = token
    return token ?? null
  } catch {
    return null
  }
}

export async function getXSRFToken() {
  await fetchCsrfToken()
  return csrfTokenCache
}

/* -------------------------------------------------------------------------- */
/*                                Auth helpers                                */
/* -------------------------------------------------------------------------- */

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

/**
 * Store the token for the API client and mirror it into a readable cookie.
 *
 * The cookie lets the server validate the session during SSR / route
 * `beforeLoad` (see `lib/auth.ts`). It is intentionally not httpOnly: the
 * browser only sends it to our own origin and the server verifies it against
 * the backend before trusting it.
 */
export function setAuthToken(token: string) {
  if (typeof window === 'undefined') return
  localStorage.setItem(TOKEN_KEY, token)
  document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)}; path=/; max-age=604800; samesite=lax`
}

export function clearAuthToken() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(TOKEN_KEY)
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; samesite=lax`
}

export function isAuthenticated() {
  return Boolean(getAuthToken())
}

/* -------------------------------------------------------------------------- */
/*                                Interceptors                                */
/* -------------------------------------------------------------------------- */

// Single request interceptor: Bearer token + CSRF token for mutating requests.
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = getAuthToken()
    if (token) config.headers.Authorization = `Bearer ${token}`

    const method = (config.method ?? 'get').toLowerCase()
    const isCsrfEndpoint = (config.url ?? '').includes('/csrf-token')

    if (MUTATING_METHODS.includes(method) && !isCsrfEndpoint) {
      const csrf = csrfTokenCache ?? (await fetchCsrfToken())
      if (csrf) config.headers.set('x-csrf-token', csrf)
    }

    return config
  },
  (error: AxiosError) => Promise.reject(error),
)

// Handle 401 globally (except on login form submit)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isLoginRequest = error.config?.url?.includes('/auth/login')
    if (error.response?.status === 401 && !isLoginRequest) {
      clearAuthToken()
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  },
)

/* -------------------------------------------------------------------------- */
/*                               Error utilities                              */
/* -------------------------------------------------------------------------- */

// Generic error message for all endpoints (except login).
export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data.message || fallback
  }
  return error instanceof Error && error.message ? error.message : fallback
}

export default apiClient
