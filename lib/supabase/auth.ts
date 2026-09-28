/**
 * Centralizador de helpers de Supabase Auth para Habitat MVP.
 */

export {
  createSupabaseServerClient,
  getCurrentUser,
  getCurrentSession,
  isAuthenticated,
  signOutServer,
} from './server'

export {
  createSupabaseBrowserClient,
  getClientUser,
  getClientSession,
  isClientAuthenticated,
  signOutClient,
} from './client'

export { updateSession } from './proxy'

export {
  useCurrentUserProfile,
  getInitials,
  type UserProfile,
} from './useProfile'

