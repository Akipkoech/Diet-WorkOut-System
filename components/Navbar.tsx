"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { OnboardingDialog } from "./onboarding-dialog";
import { useAuth } from "@/app/contexts/AuthContext";
import { cn } from "@/lib/utils"; // Import the cn utility

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check if the current route is "/dashboard"
  const isDashboard = pathname?.startsWith("/dashboard");

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false); // Close mobile menu on logout
      router.push("/"); // Redirect to home page after logout
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Do not render the Navbar if the user is on the dashboard
  if (isDashboard) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full bg-gray-900 text-white">
      <div className="container flex h-12 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-lg font-bold text-red-500">Fitness Studio</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          <Link href="/" className="transition-colors hover:text-red-500">
            Home
          </Link>
          <Link href="/about" className="transition-colors hover:text-red-500">
            About
          </Link>
          <Link href="/services" className="transition-colors hover:text-red-500">
            Services
          </Link>
          <Link href="/contact" className="transition-colors hover:text-red-500">
            Contact
          </Link>
          {/* Conditionally render Dashboard link for authenticated users */}
          {isAuthenticated && (
            <Link href="/dashboard" className="transition-colors hover:text-red-500">
              Dashboard
            </Link>
          )}
        </nav>

        {/* Desktop Buttons */}
        <div className="hidden md:flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              <button
                onClick={handleLogout}
                className={cn(
                  "flex items-center gap-4 rounded-lg px-3 py-2 transition-colors",
                  "text-gray-400 hover:bg-gray-800 hover:text-white"
                )}
              >
                <LogOut className="h-5 w-5 shrink-0 text-red-500" />
                <span className="text-sm font-medium">Logout</span>
              </button>
            </>
          ) : (
            <>
              <Button
                asChild
                variant="ghost"
                className="text-sm text-white hover:text-red-500 hover:bg-transparent"
              >
                <Link href="/login">Sign In</Link>
              </Button>
              <OnboardingDialog />
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                className="px-0 text-white hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-[#1E2A44] text-white">
              <nav className="flex flex-col space-y-4 mt-6">
                <Link
                  href="/"
                  className="transition-colors hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  href="/about"
                  className="transition-colors hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link
                  href="/services"
                  className="transition-colors hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="/contact"
                  className="transition-colors hover:text-red-500"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Contact
                </Link>
                {/* Conditionally render Dashboard link for authenticated users */}
                {isAuthenticated && (
                  <Link
                    href="/dashboard"
                    className="transition-colors hover:text-red-500"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                {isAuthenticated && (
                  <div className="pt-4">
                    <button
                      onClick={handleLogout}
                      className={cn(
                        "flex items-center gap-5 rounded-lg px-3 py-2 transition-colors w-full",
                        "text-red-500 hover:bg-red-500 hover:text-white"
                      )}
                    >
                      <LogOut className="h-5 w-5 shrink-0 text-red-500" />
                      <span className="text-sm font-medium">Logout</span>
                    </button>
                  </div>
                )}
                {!isAuthenticated && (
                  <div className="pt-4">
                    <Button
                      asChild
                      variant="ghost"
                      className="w-full justify-start text-white hover:text-red-500 hover:bg-transparent"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Link href="/login">Sign In</Link>
                    </Button>
                    <OnboardingDialog />
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}