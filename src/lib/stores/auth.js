import { goto } from '$app/navigation'
import { Magic } from 'magic-sdk'
import { derived, get, writable } from 'svelte/store'

const initAuth = { token: null, exp: null, userInfo: {} }
function createAuth() {
  if (typeof window == 'undefined') return writable(initAuth)
  var userInfo = localStorage.getItem('userInfo')
  return writable({
    token: localStorage.getItem('token'),
    exp: localStorage.getItem('exp'),
    userInfo: userInfo ? JSON.parse(userInfo) : {},
  })
}

export const auth = createAuth()

export function setAuthState({ token, userInfo, exp }) {
  localStorage.setItem('token', token)
  localStorage.setItem('exp', exp)
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
  auth.set({ token, userInfo, exp })
}

export const isAuthenticated = derived(auth, ({ token, exp }) =>
  !token || !exp ? false : new Date() < new Date(exp)
)

// *** Methods requiring async below ***
/**
 * Automatically takes care sending JSON if object, and parsing JSON responses.
 * @param {string} route - path after base route
 * @param {object} init
 * @returns {object|Response}
 */
async function q(route, { ...init } = {}) {
  if (init.body && typeof init.body == 'object') {
    init.body = JSON.stringify(init.body)
    init.headers ??= {}
    init.headers['Content-type'] = 'application/json'
  }

  const resp = await fetch(
    `${
      import.meta.env.PROD
        ? import.meta.env.VITE_API_URL
        : import.meta.env.VITE_DEV_API_URL
    }${route}`,
    init
  )
  if (resp.headers.get('Content-type') == 'application/json')
    return await resp.json()

  return resp
}

/** Any method can be used as a property through proxy e.g.
 * ```js
 * query.get('/route', {body:{}})
 * ```
 * It's an axios/express-like API
 */
export const apiQ = {
  __proto__: new Proxy(
    {},
    {
      get:
        (target, prop) =>
        (route, init = {}) =>
          q(route, { method: prop.toUpperCase(), ...init }),
    }
  ),
  fetch: q,
}

/** The didToken is basically the user's password. Used to verify them
 * @param {string} email
 * @param {string} didToken
 * @returns {Promise}
 * ```js
 * //authState
 * {
 *   token,
 *   exp,
 *   userInfo: { email }
 * }
 * ```
 */
export function apiLogin(email, didToken) {
  return apiQ.post('/login', {
    headers: { Authorization: `Bearer ${didToken}` },
    body: { email },
  })
}

// apparently logging in endpoint can also act as refreshing tokens. Basically equivalent
// only difference is how magic on the frontend is handled to get didToken again
export const apiRefresh = apiLogin

const m = new Magic(import.meta.env.VITE_MAGIC_PUBLIC)

/** Login with an email and return new auth state, else return undefined */
export async function login(email) {
  try {
    const didToken = await m.auth.loginWithMagicLink({
      email,
    })
    // Validate the did token on the server
    if (didToken) {
      const authPayload = await apiLogin(email, didToken)
      // Finish up login
      if (authPayload?.token) {
        setAuthState(authPayload)
        return authPayload
      }
    }
  } catch (error) {
    console.log(error)
  }
}

/** Refresh if possible and return new auth state, else return undefined. */
export async function refresh() {
  var authState
  try {
    const { email } = get(auth)
    // we won't even bother checking m.user.isloggedIn() in b/c backend will validate
    const authPayload = await apiRefresh(email, await m.user.getIdToken())
    if (authPayload?.token) {
      authState = authPayload
      setAuthState(authPayload)
    }
  } catch (error) {
    console.log(error)
  }
  return authState
}

/** Remove token and log out of Magic, then go to login page */
export async function logout() {
  const mLogoutProm = m.user.logout()
  localStorage.removeItem('token')
  localStorage.removeItem('exp')
  localStorage.removeItem('userInfo')
  auth.set(initAuth)
  await mLogoutProm
  goto('/login')
}

// example role checking
// export const isAdmin = () => get(auth).userInfo?.role === 'admin'
