
import { getSession } from "next-auth/react"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

type FetchOptions = Omit<RequestInit, 'headers'> & {
    headers?: Record<string, string>
}

export const apiClient = {
    async fetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
        const session = await getSession()
        // @ts-ignore
        const token = session?.accessToken

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
            ...options.headers,
        }

        if (token) {
            headers["Authorization"] = `Bearer ${token}`
        }

        const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

        const response = await fetch(url, {
            ...options,
            headers,
        })

        if (!response.ok) {
            // Handle generic errors
            const errorText = await response.text()
            throw new Error(`API Error ${response.status}: ${errorText}`)
        }

        // Handle 204 No Content
        if (response.status === 204) {
            return {} as T
        }

        try {
            return await response.json()
        } catch {
            return {} as T
        }
    }
}
