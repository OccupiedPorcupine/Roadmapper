# Project Specifics: AI Roadmap Builder - Frontend Authentication

**Goal:** Implement a secure, industry-standard authentication system using Clerk for Next.js. Users must be able to sign in, stay logged in across sessions, and see a profile dropdown in the navigation bar.

## 1. The Authentication Stack

- **Library:** `@clerk/nextjs`
- **Why:** It provides pre-built, highly accessible UI components (`<SignInButton />`, `<UserButton />`) and handles session management via secure HttpOnly cookies automatically.
- **Theme:** Dark mode by default to match the cinematic UI.

## 2. Global Setup (Middleware & Provider)

**A. Middleware Setup**
- **File:** `frontend/src/middleware.ts`
- **Requirements:** Implement Clerk's `authMiddleware` (or standard `clerkMiddleware` for Next.js 14+). 
- **Routing:** Ensure the landing page (`/`) and the API route (`/api/generate`) are public so users can see the "What do you want to learn today?" input without being forced to log in immediately. Protect dashboard/roadmap specific routes if they exist.

**B. Root Layout Provider**
- **File:** `frontend/src/app/layout.tsx`
- **Requirements:** Wrap the entire `html` or `body` inside the `<ClerkProvider>`. 
- **Theming:** Import the `dark` theme from `@clerk/themes` and pass it to the `ClerkProvider` appearance prop so the auth modals match our black/neon aesthetic.

## 3. The Navigation Bar UI (Top Right)

**File:** `frontend/src/components/ui/Navbar.tsx` (or wherever the top navigation is defined).

**Requirements:**
Use Clerk's conditional rendering components to handle the "Logged In" vs "Logged Out" states automatically.

- **When Logged Out (`<SignedOut>`):**
  - Render the `<SignInButton />`.
  - Style the trigger button to match the sleek, premium dark theme (e.g., a subtle white border, transparent background, white text).

- **When Logged In (`<SignedIn>`):**
  - Render the `<UserButton />`. This automatically provides a circular profile picture that, when clicked, opens a dropdown to manage their account or sign out.
  - Enable the hamburger menu on the Top Left to allow access to the "Your Roadmaps" sidebar drawer.

### Target Implementation Reference (Navbar):
```tsx
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full flex justify-between items-center p-6 z-50">
      {/* Top Left: Hamburger Menu */}
      <div>
        <SignedIn>
          <button className="text-white hover:text-gray-300 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
        </SignedIn>
        <SignedOut>
          <div className="w-6 h-6 opacity-50 cursor-not-allowed">
            <Menu className="w-6 h-6 text-gray-500" />
          </div>
        </SignedOut>
      </div>

      {/* Top Right: Authentication */}
      <div>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 rounded-md border border-white/20 text-white hover:bg-white/10 transition-all">
              Sign In
            </button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <UserButton 
            afterSignOutUrl="/" 
            appearance={{
              elements: { avatarBox: "w-10 h-10" }
            }}
          />
        </SignedIn>
      </div>
    </nav>
  );
}