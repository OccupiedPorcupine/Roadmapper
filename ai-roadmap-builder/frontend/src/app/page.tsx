"use client";

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { LandingNavBar } from "@/components/features/LandingNavBar"
import { HeroSection } from "@/components/features/HeroSection"
import { SidebarDrawer } from "@/components/features/SidebarDrawer"

const MOCK_ROADMAP_TITLES = [
  "Learn React Native in 12 weeks",
  "Astrophysics fundamentals",
  "Pottery from scratch",
]

export default function HomePage() {
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [roadmapTitles] = useState<string[]>(MOCK_ROADMAP_TITLES)

  const handleSignIn = useCallback(() => setIsLoggedIn(true), [])
  const handleSignOut = useCallback(() => setIsLoggedIn(false), [])
  const handleHamburger = useCallback(() => setSidebarOpen((o) => !o), [])
  const handleCloseSidebar = useCallback(() => setSidebarOpen(false), [])

  const handleHeroSubmit = useCallback(
    (value: string) => {
      const query = value.trim()
      if (query) router.push(`/roadmap?q=${encodeURIComponent(query)}`)
    },
    [router]
  )

  return (
    <>
      <LandingNavBar
        isLoggedIn={isLoggedIn}
        onHamburgerClick={handleHamburger}
        onSignInClick={handleSignIn}
        onSignOutClick={handleSignOut}
      />
      <HeroSection onSubmit={handleHeroSubmit} />
      <SidebarDrawer
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
        roadmapTitles={roadmapTitles}
      />
    </>
  )
}
