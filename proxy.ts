import { auth } from '@/auth'

export default auth((request) => {
  if (!request.auth && request.nextUrl.pathname.startsWith('/dashboard')) {
    const loginUrl = new URL('/login', request.nextUrl.origin)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return Response.redirect(loginUrl)
  }
})

export const config = { matcher: ['/dashboard/:path*'] }