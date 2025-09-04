// Lightweight helpers to persist small, non-sensitive session-related data in cookies
// Cookies used: lw_uid, lw_nick, lw_admin ("1"/"0")

export const useSessionCookies = () => {
  const cookieOpts = {
    path: '/',
    sameSite: 'lax' as const,
    secure: typeof window !== 'undefined' ? window.location.protocol === 'https:' : true,
    maxAge: 60 * 60 * 24 * 180, // 180 days
  }

  const uid = useCookie<string | null>('lw_uid', cookieOpts)
  const nick = useCookie<string | null>('lw_nick', cookieOpts)
  // Admin flag removed per security preference; backend drives authorization
  // JWT/Access token (client-side readable). If your backend can set HttpOnly
  // cookies, prefer that; this is a fallback for SPA persistence.
  const token = useCookie<string | null>('lw_token', {
    ...cookieOpts,
    maxAge: 60 * 60 * 24 * 7, // 7 days default
  })

  const setUser = (params: { id?: string | null; displayName?: string | null }) => {
    if (typeof params.id !== 'undefined') uid.value = params.id || null
    if (typeof params.displayName !== 'undefined') nick.value = params.displayName || null
  }

  const setToken = (value: string | null) => {
    token.value = value
  }

  const clear = () => {
    uid.value = null
    nick.value = null
    // no admin cookie
    token.value = null
  }

  return {
    uid,
    nick,
    setUser,
    token,
    setToken,
    clear,
  }
}
