
import { auth } from "@/auth"
import { HomePageClient } from "@/components/features/HomePageClient"
import { SignIn } from "@/components/auth/sign-in"
import { SignOut } from "@/components/auth/sign-out"

export default async function HomePage() {
  const session = await auth()

  return (
    <HomePageClient
      user={session?.user}
      signInButton={<SignIn />}
      signOutButton={<SignOut />}
    />
  )
}
