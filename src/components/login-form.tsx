import * as React from 'react'
import { cn } from 'cn'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'

export interface LoginCredentials {
  email: string
  password: string
}

export function LoginForm({
  className,
  onSubmit,
  onDemoLogin,
  isLoading = false,
  error,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onSubmit'> & {
  onSubmit?: (credentials: LoginCredentials) => void | Promise<void>
  onDemoLogin?: () => void
  isLoading?: boolean
  error?: string | null
}) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    void onSubmit?.({ email, password })
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="cashier@7bcoffee.com"
                  autoComplete="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </Field>
              <Field>
                <div className="flex items-center">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                />
              </Field>

              {error ? (
                <FieldDescription className="text-destructive">
                  {error}
                </FieldDescription>
              ) : null}

              <Field>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Processing...' : 'Sign in'}
                </Button>
                <FieldDescription className="text-center">
                  Don&apos;t have an account? <a href="#">Contact admin</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
