'use client'

import { useEffect, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import { ChevronsUpDownIcon, BadgeCheckIcon, LogOutIcon } from 'lucide-react'
import { useNavigate } from '@tanstack/react-router'

import { authApi } from '@/hooks/api'
import { getCurrentUser, invalidateAuthSession } from '@/lib/auth'
import { clearAuthToken } from '@/lib/axios'

interface UserInfo {
  id: string;
  name: string
  email: string
  role?: string
  avatar?: string
}

const EMPTY_USER: UserInfo = { id: '', name: '', email: '' }

function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('')

  return initials || 'U'
}

/** Read the profile cached on a previous visit (client only, for a fast paint). */
function readCachedUser(): UserInfo {
  if (typeof window === 'undefined') return EMPTY_USER

  try {
    const saved = localStorage.getItem('profile')
    if (!saved) return EMPTY_USER

    const parsed: unknown = JSON.parse(saved)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_USER

    const record = parsed as Record<string, unknown>
    return {
      id: typeof record.id === 'string' ? record.id : '',
      name: typeof record.name === 'string' ? record.name : '',
      email: typeof record.email === 'string' ? record.email : '',
      role: typeof record.role === 'string' ? record.role : undefined,
      avatar: typeof record.avatar === 'string' ? record.avatar : undefined,
    }
  } catch (error) {
    console.warn('Failed to read saved user info:', error)
    return EMPTY_USER
  }
}

export function NavUser() {
  const { isMobile } = useSidebar()
  const navigate = useNavigate()
  const [user, setUser] = useState<UserInfo>(EMPTY_USER)

  useEffect(() => {
    let isMounted = true

    // Read cached profile only on the client to avoid SSR hydration mismatch.
    setUser(readCachedUser())

    // The route guard already validated the session; this refreshes the
    // profile details from the backend.
    getCurrentUser()
      .then((profile) => {
        if (!isMounted) return

        const updatedUser: UserInfo = {
          id: profile.id as string,
          name: profile.name,
          email: profile.email,
          role: profile.role || undefined,
          avatar: profile.avatar || undefined,
        }

        setUser(updatedUser)
        localStorage.setItem('profile', JSON.stringify(updatedUser))
      })
      .catch((error: unknown) => {
        console.warn('Failed to load user info:', error)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const displayName = user.name || 'User'
  const initials = getInitials(displayName)

  const handleLogout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore network errors; local data is still cleared below.
    } finally {
      clearAuthToken()
      invalidateAuthSession()
      localStorage.removeItem('profile')
      await navigate({ to: '/login', replace: true })
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={displayName} />
                <AvatarFallback className="rounded-lg">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{displayName}</span>
                <span className="truncate text-xs">{user.email}</span>
              </div>
              <ChevronsUpDownIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? 'bottom' : 'right'}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={user.avatar} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs">{user.email}</span>
                  {user.role && (
                    <span className="truncate text-[10px] text-muted-foreground">
                      {user.role}
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem>
                <BadgeCheckIcon />
                Account
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
