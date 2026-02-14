
import { signOut } from "@/auth"

export function SignOut() {
    return (
        <form
            action={async () => {
                "use server"
                await signOut()
            }}
        >
            <button
                type="submit"
                className="flex h-9 items-center gap-2 rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 hover:border-white/30"
            >
                <span className="size-5 rounded-full bg-gradient-to-br from-blue-400 to-pink-500" aria-hidden />
                Sign Out
            </button>
        </form>
    )
}
