"use client"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/app/contexts/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, loading, isAdmin, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname() // Use the usePathname hook to get the current path

  useEffect(() => {
    if (!loading) {
      // If not authenticated, redirect to login
      if (!isAuthenticated) {
        router.push("/login")
      } 
      // If admin is required but user is not admin, redirect to dashboard
      else if (requireAdmin && !isAdmin) {
        router.push("/dashboard")
      }
      // If user is admin but trying to access regular dashboard, redirect to admin dashboard
      else if (!requireAdmin && isAdmin && pathname === "/dashboard") {
        router.push("/admin")
      }
    }
  }, [loading, isAuthenticated, isAdmin, router, requireAdmin, pathname]) // Add pathname to the dependency array

  // Show loading state while checking authentication
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  // If trying to access admin route without admin role
  if (requireAdmin && !isAdmin) {
    return null
  }

  // If not authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}