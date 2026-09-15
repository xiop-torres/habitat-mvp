import type { DefaultSession } from 'next-auth'

// Keep the existing MongoDB roles until the authentication migration.
type UserRole = 'tenant' | 'owner' | 'admin'

declare module 'next-auth' {
  interface User {
    role?: UserRole
  }

  interface Session {
    user: DefaultSession['user'] & {
      id: string
      role?: UserRole
    }
  }
}

