# example-magic-kit-fauna-urql

Goals:

- Establish an auth boilerplate for Svelte Kit, Fauna, Magic Link, and urql. Comprised mostly of GraphQL.
- DB interface is all GraphQL, but there's a need for Netlify Functions (or some Node-based backend) for Magic validation/metadata.

Relevant parts:

- deps: `@urql/svelte`
- devDeps: `graphql`, `@urql/exchange-auth`, `magic-sdk`
- `svelte.config.js` -> `kit.vite.optimizeDeps.exclude` = `['@urql/svelte']`
- `$lib/stores/auth.js` - there's a lot of auth logic it handles, most notably auth state and login/refresh tokens.
  - `login()` is very flexible, doesn't redirect, and can even be used on a widget. Doesn't have to be on a login page.
  - You can reactively redirect on login by checking the `isAuthenticated` derived store. This is what the login page does.
- `$lib/gql/`
  - `schema.gql`, `setup.fql`, `urql.js`
- `login.svelte` - also acts as signup. Looking good 👩‍🍳 chef's kiss
- `.env.example` - public env variables only, remove .example to use

## Config

- ❕ you must `initClient()` somewhere. Normally that's in `__layout`
- ⬆ update `setup.fql` login_user function's `ttl` to suit your desired access token expiry target. Default 30 days, which may be too long for most tastes'.
- you may want to disable SSR globally, and explicitly enable it on pages that're public

Refer to https://github.com/armchair-traveller/mlfkn for login backend. Very simple and easy to adapt to other serverless platforms.

## Flow

- `auth.js` store keeps auth info in memory
- Login -> Magic Link didToken -> Backend validate: didToken -> Backend response: Fauna access token -> Set/Save access token (store/localStorage)
- App init: load access token from localStorage.
  - `@urql/exchange-auth` silently manages refreshing on expiration or token invalidation (auth errors), logging out on failure to refresh
  - Refresh flow: Magic client gets didToken from existing session -> Login flow starting from Backend validation
  - The shorter lived the access token, the less risk. Best practice numbers range from 10m, 20m, 1hr (>8hrs/1d is typically used in refresh tokens, or if user's security is less of a concern).
  - Refresh token is basically didToken, which is retrieved by Magic. Essentially, Magic manages to persist the session over a long period.
    - Magic retrieves didToken, and basically another backend login is performed as backend validates didToken and returns new access token.

## Notes

- You can remove localStorage from the equation and not use cookies either... which will result in better security with slightly more cost.
  - However this means a new access token is generated on every page refresh or new tab. Because refresh token is not managed by the consumer, a hop of retrieving didToken via Magic introduces a slight delay (probably not a lot, maybe a couple hundred ms).
  - To do this, you'd have to rework the store logic `auth.js`, removing localStorage and adding Magic.user.isLoggedIn() to .isAuthenticated(), and set to always init defaults. As well as init refresh in `urql.js`.
