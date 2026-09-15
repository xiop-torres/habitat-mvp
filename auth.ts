import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from '@/lib/dbConnect'
import User from '@/models/User'

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [Credentials({
    name: 'credentials',
    credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Contraseña', type: 'password' } },
    async authorize(credentials) {
      if (!credentials?.email || !credentials?.password) return null
      await dbConnect()
      const user = await User.findOne({ email: String(credentials.email).toLowerCase() })
      if (!user || !(await bcrypt.compare(String(credentials.password), user.passwordHash))) return null
      return { id: user._id.toString(), name: user.name, email: user.email, role: user.role }
    },
  })],
  callbacks: {
    async jwt({ token, user }) { if (user) { token.id = user.id; token.role = user.role }; return token },
    async session({ session, token }) {
      if (session.user && typeof token.id === 'string') {
        session.user.id = token.id
        session.user.role = token.role === 'tenant' || token.role === 'owner' || token.role === 'admin'
          ? token.role
          : undefined
      }
      return session
    },
  },
})
