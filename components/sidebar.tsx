"use client";

import { Link, BarChart, QrCode, Settings, Home } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SidebarProps {
  className?: string;
}

export function AppSidebar({ className }: SidebarProps) {
  return (
    <Sidebar className={className} collapsible="icon">
      <SidebarHeader className="border-b border-border p-4">
        <div className="flex items-center gap-2">
          <Link className="h-6 w-6" />
          <h1 className="text-xl font-bold group-data-[state=collapsed]:hidden">
            QR Bin
          </h1>
        </div>
      </SidebarHeader>

      <SidebarContent className="py-2 px-2">
        <SidebarMenu className="space-y-2">
          <SidebarMenuItem className="mt-1">
            <SidebarMenuButton asChild className="py-2">
              <a href="/" className="flex items-center gap-3">
                <Home className="h-8 w-8" />
                <span>Dashboard</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className="mt-3">
            <SidebarMenuButton asChild className="py-2">
              <a href="/links" className="flex items-center gap-3">
                <Link className="h-8 w-8" />
                <span>My Links</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className="mt-3">
            <SidebarMenuButton asChild className="py-2">
              <a href="/qr-codes" className="flex items-center gap-3">
                <QrCode className="h-8 w-8" />
                <span>QR Codes</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem className="mt-3">
            <SidebarMenuButton asChild className="py-2">
              <a href="/analytics" className="flex items-center gap-3">
                <BarChart className="h-8 w-8" />
                <span>Analytics</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="border-t border-border p-4">
        <div className="flex flex-col gap-2">
          <SidebarMenu className="space-y-2">
            <SidebarMenuItem className="mt-1">
              <SidebarMenuButton asChild className="py-2">
                <a href="/settings" className="flex items-center gap-3">
                  <Settings className="h-5 w-5" />
                  <span>Settings</span>
                </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          <div className="flex justify-end mt-4">
            <ThemeToggle />
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
