'use client'

import * as React from 'react'
import { Link, useRouterState } from '@tanstack/react-router'

import { NavUser } from '@/components/nav-user'
import { TeamSwitcher } from '@/components/team-switcher'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from '@/components/ui/sidebar'
import {
  CoffeeIcon,
  ReceiptIcon,
  SettingsIcon,
  ShoppingBagIcon,
  TagIcon,
  UtensilsCrossedIcon,
} from 'lucide-react'

const data = {
  user: {
    name: 'Dimas Satrio',
    email: 'cashier@7bcoffee.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: '7B Coffee POS',
      logo: <CoffeeIcon />,
      plan: 'Senopati Branch',
    },
  ],
  navMain: [
    { title: 'Cashier Catalog', to: '/', icon: UtensilsCrossedIcon },
    { title: 'Table Orders', to: '/table-orders', icon: ShoppingBagIcon },
    {
      title: 'Transaction History',
      to: '/transaction-history',
      icon: ReceiptIcon,
    },
    { title: 'Product Catalog', to: '/product-catalog', icon: TagIcon },
    { title: 'Settings', to: '/settings', icon: SettingsIcon },
  ] as const,
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={pathname === item.to}
                >
                  <Link to={item.to}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
