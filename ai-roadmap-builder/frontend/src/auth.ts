import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { SignJWT } from "jose"

export const { handlers, auth, signIn, signOut } = NextAuth({
    providers: [Google],
    callbacks: {
        async jwt({ token, user, account }) {
            if (user) {
                token.id = user.id
                token.email = user.email
                token.name = user.name
                token.picture = user.image

                // Create a custom token for the backend
                const secret = new TextEncoder().encode(process.env.AUTH_SECRET)
                const backendToken = await new SignJWT({
                    sub: user.id || token.sub,
                    email: user.email,
                    name: user.name,
                    picture: user.image
                })
                    .setProtectedHeader({ alg: 'HS256' })
                    .setIssuedAt()
                    .setExpirationTime('1w') // 1 week
                    .sign(secret)

                token.backendToken = backendToken
            }
            return token
        },
        session({ session, token }) {
            if (session.user && token.id) {
                session.user.id = token.id as string
            }
            if (token.backendToken) {
                // @ts-ignore // Extend session type if needed
                session.accessToken = token.backendToken as string
            }
            return session
        },
    },
})
