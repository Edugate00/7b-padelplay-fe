"use client"

import * as React from "react"

import { NavUser } from "@/components/nav-user"
import { TeamSwitcher } from "@/components/team-switcher"
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
} from "@/components/ui/sidebar"
import {
  CoffeeIcon,
  LockIcon,
  ReceiptIcon,
  SettingsIcon,
  ShoppingBagIcon,
  TagIcon,
  UtensilsCrossedIcon,
} from "lucide-react"

const data = {
  user: {
    name: "Dimas Satrio",
    email: "kasir@7bcoffee.com",
    avatar: "/avatars/shadcn.jpg",
  },
  teams: [
    {
      name: "7B Coffee POS",
      logo: <CoffeeIcon />,
      plan: "Cabang Senopati",
    },
  ],
  navMain: [
    { title: "Katalog Kasir", icon: UtensilsCrossedIcon, isActive: true },
    { title: "Pesanan Meja", icon: ShoppingBagIcon, isActive: false },
    { title: "Riwayat Transaksi", icon: ReceiptIcon, isActive: false },
    { title: "Katalog Produk", icon: TagIcon, isActive: false },
    { title: "Pengaturan", icon: SettingsIcon, isActive: false },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
                  tooltip={item.title}
                  isActive={item.isActive}
                >
                  <item.icon />
                  <span>{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          {/* <SidebarMenuItem>
            <SidebarMenuButton tooltip="Tutup Kasir Shift" variant="outline">
              <LockIcon />
              <span>Tutup Kasir Shift</span>
            </SidebarMenuButton>
          </SidebarMenuItem> */}
        </SidebarMenu>
        <NavUser user={data.user} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}