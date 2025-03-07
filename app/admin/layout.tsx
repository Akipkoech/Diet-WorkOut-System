"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Users,
  Dumbbell,
  LineChart,
  Settings,
  PanelLeft,
  LayoutDashboard,
  MessageSquare,
  Bell,
  FileText,
  HelpCircle,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/contexts/AuthContext"
import ProtectedRoute from "@/components/ProtectedRoute"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isExpanded, setIsExpanded] = useState(true)
  const pathname = usePathname()
  const { logout } = useAuth()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/admin",
      color: "text-sky-500",
    },
    {
      label: "User Management",
      icon: Users,
      href: "/admin/users",
      color: "text-violet-500",
    },
    {
      label: "Workout Plans",
      icon: Dumbbell,
      href: "/admin/workouts",
      color: "text-red-500",
    },
    {
      label: "Analytics",
      icon: LineChart,
      href: "/admin/analytics",
      color: "text-green-500",
    },
    {
      label: "Reports",
      icon: FileText,
      href: "/admin/reports",
      color: "text-yellow-500",
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: "/admin/messages",
      color: "text-pink-500",
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/admin/notifications",
      color: "text-orange-500",
    },
    {
      label: "Support",
      icon: HelpCircle,
      href: "/admin/support",
      color: "text-blue-500",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-500",
    },
  ]

  return (
    <ProtectedRoute requireAdmin={true}>
      <div className="relative min-h-screen">
        <div className="flex">
          {/* Sidebar */}
          <aside
            className={cn("relative h-screen transition-all duration-300 ease-in-out", isExpanded ? "w-64" : "w-16")}
          >
            <div className="fixed h-full bg-gray-900">
              {/* Toggle button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-3 z-50 h-8 w-8 text-white hover:bg-gray-800"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <PanelLeft className={cn("h-5 w-5 transition-transform duration-300", !isExpanded && "rotate-180")} />
              </Button>

              {/* Logo */}
              <div className="flex h-14 items-center border-b border-gray-800 px-4">
                <Link href="/" className="flex items-center gap-2">
                  <Dumbbell className="h-6 w-6 text-red-500" />
                  <span
                    className={cn(
                      "text-lg font-bold text-white transition-opacity duration-300",
                      isExpanded ? "opacity-100" : "opacity-0 hidden",
                    )}
                  >
                    Fitness Studio
                  </span>
                </Link>
              </div>

              {/* Navigation */}
              <nav className="flex flex-col gap-2 p-3">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-4 rounded-lg px-3 py-2 transition-colors",
                      pathname === route.href
                        ? "bg-gray-800 text-white"
                        : "text-gray-400 hover:bg-gray-800 hover:text-white",
                      !isExpanded && "justify-center px-2",
                    )}
                  >
                    <route.icon className={cn("h-5 w-5 shrink-0", route.color)} />
                    {isExpanded && <span className="text-sm font-medium">{route.label}</span>}
                  </Link>
                ))}

                {/* Logout button */}
                <button
                  onClick={logout}
                  className={cn(
                    "flex items-center gap-4 rounded-lg px-3 py-2 transition-colors mt-auto",
                    "text-gray-400 hover:bg-gray-800 hover:text-white",
                    !isExpanded && "justify-center px-2",
                  )}
                >
                  <LogOut className="h-5 w-5 shrink-0 text-red-500" />
                  {isExpanded && <span className="text-sm font-medium">Logout</span>}
                </button>
              </nav>
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 overflow-x-hidden">
            <div className="container mx-auto">{children}</div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}