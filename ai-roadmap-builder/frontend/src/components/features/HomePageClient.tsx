"use client";

import { useState, useCallback, ReactNode } from "react"
import { useRouter } from "next/navigation"
import { LandingNavBar } from "@/components/features/LandingNavBar"
import { HeroSection } from "@/components/features/HeroSection"
import { SidebarDrawer } from "@/components/features/SidebarDrawer"

const MOCK_ROADMAP_TITLES = [
    "Learn React Native in 12 weeks",
    "Astrophysics fundamentals",
    "Pottery from scratch",
]

interface HomePageClientProps {
    children?: ReactNode // For auth button slot if needed?
    signInButton: ReactNode
    signOutButton: ReactNode
    user?: any
}

export function HomePageClient({ signInButton, signOutButton, user }: HomePageClientProps) {
    const router = useRouter()
    // const [isLoggedIn, setIsLoggedIn] = useState(!!user) // Derive from user prop
    const isLoggedIn = !!user

    const [sidebarOpen, setSidebarOpen] = useState(false)

    // We can keep these if we want client-side optimistic updates, but standard auth flow reloads.
    // const handleSignIn = useCallback(() => setIsLoggedIn(true), [])
    // const handleSignOut = useCallback(() => setIsLoggedIn(false), [])

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
                // Pass buttons instead of callbacks
                authButton={isLoggedIn ? signOutButton : signInButton}
            />
            <HeroSection onSubmit={handleHeroSubmit} />
            <SidebarDrawer
                isOpen={sidebarOpen}
                onClose={handleCloseSidebar}
                roadmapTitles={MOCK_ROADMAP_TITLES}
            />
        </>
    )
}
