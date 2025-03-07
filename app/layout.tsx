"use client"

import type React from "react"
import "./globals.css"
import { Inter } from "next/font/google"
import { usePathname } from "next/navigation"
import Navbar from "@/components/Navbar"
import Footer from "@/components/footer"
import { AuthProvider } from "./contexts/AuthContext"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin")

  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <div className="flex min-h-screen flex-col">
            {!isDashboard && <Navbar />}
            <main className="flex-1">{children}</main>
            {!isDashboard && <Footer />}
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}