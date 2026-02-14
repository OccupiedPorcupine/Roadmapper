"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface LandingNavBarProps {
  isLoggedIn: boolean;
  onHamburgerClick: () => void;
  onSignInClick: () => void;
  onSignOutClick: () => void;
}

export function LandingNavBar({
  isLoggedIn,
  onHamburgerClick,
  onSignInClick,
  onSignOutClick,
}: LandingNavBarProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex h-14 items-center justify-between border-b border-white/5 bg-black/80 px-6 backdrop-blur-md">
      {/* Hamburger - left */}
      <button
        type="button"
        aria-label="Open menu"
        onClick={onHamburgerClick}
        disabled={!isLoggedIn}
        className={cn(
          "flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-lg transition-colors",
          isLoggedIn
            ? "text-white hover:bg-white/10 active:bg-white/15"
            : "cursor-not-allowed text-white/35"
        )}
      >
        <span className="h-0.5 w-5 bg-current" />
        <span className="h-0.5 w-5 bg-current" />
        <span className="h-0.5 w-5 bg-current" />
      </button>

      {/* Auth - right */}
      <div className="flex items-center gap-3">
        {isLoggedIn ? (
          <motion.button
            type="button"
            initial={false}
            animate={{ opacity: 1 }}
            className="flex h-9 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:border-white/30"
            onClick={onSignOutClick}
          >
            <span className="size-5 rounded-full bg-gradient-to-br from-blue-400 to-pink-500" aria-hidden />
            Sign Out
          </motion.button>
        ) : (
          <button
            type="button"
            className="rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
            onClick={onSignInClick}
          >
            Sign In
          </button>
        )}
      </div>
    </nav>
  );
}
