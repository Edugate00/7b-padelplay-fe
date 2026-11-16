import * as React from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Coffee } from 'lucide-react'

import { LoginForm } from '@/components/login-form'
import type { LoginCredentials } from '@/components/login-form'
import { authApi } from '@/hooks/api'
import { getApiErrorMessage, setAuthToken } from '@/lib/axios'
import { getAuthSession, invalidateAuthSession } from '@/lib/auth'

export const Route = createFileRoute('/login')({
  head: () => ({ meta: [{ title: 'Sign In · 7B Coffee POS' }] }),
  beforeLoad: async () => {
    // Already signed in: no need to show the login page again.
    const session = await getAuthSession()
    if (session.user) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

function LoginPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleLogin = async ({ email, password }: LoginCredentials) => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await authApi.login({ email, password })
      setAuthToken(data.token)
      invalidateAuthSession()
      await navigate({ to: '/', replace: true })
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Sign in failed. Please check your email and password.',
        ),
      )
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid min-h-dvh bg-background lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden bg-primary p-10 text-primary-foreground lg:flex">
        <div className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary-foreground/15">
            <Coffee className="size-5" />
          </span>
          7B Coffee POS
        </div>

        <div className="space-y-4">
          <h1 className="text-4xl font-bold leading-tight">
            Manage orders
            <br />
            faster.
          </h1>
        </div>

        <p className="text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} 7B Coffee. All rights reserved.
        </p>

        <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-primary-foreground/10" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 size-80 rounded-full bg-primary-foreground/5" />
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm space-y-6">
          <div className="space-y-1 text-center lg:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 text-base font-bold lg:hidden">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Coffee className="size-4" />
              </span>
              7B Coffee POS
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Welcome</h2>
            <p className="text-sm text-muted-foreground">
              Sign in to continue to the cashier terminal.
            </p>
          </div>

          <LoginForm
            isLoading={isLoading}
            error={error}
            onSubmit={handleLogin}
          />
        </div>
      </div>
    </div>
  )
}
