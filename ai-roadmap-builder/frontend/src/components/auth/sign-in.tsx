
import { signIn } from "@/auth"

export function SignIn() {
    return (
        <form
            action={async () => {
                "use server"
                await signIn("google")
            }}
        >
            <button
                type="submit"
                className="rounded-lg border border-white/25 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/10"
            >
                Sign In
            </button>
        </form>
    )
} 
