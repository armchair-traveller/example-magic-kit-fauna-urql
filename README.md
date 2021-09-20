# example-magic-kit-fauna-urql

Goals:

- Establish an auth boilerplate for Svelte Kit, Fauna, Magic Link, and urql. Comprised mostly of GraphQL.
- DB interface is all GraphQL, but there's a need for Netlify Functions (or some Node-based backend e.g. Fastify, Lambda, Vercel) for Magic validation/metadata.

Relevant parts:

- devDeps: `@urql/svelte`, `graphql`, `@urql/exchange-auth`, `magic-sdk`
- `$lib/stores/auth.js` - there's a lot of auth logic it handles, most notably auth state and login/refresh tokens.
  - `login()` is very flexible, doesn't redirect, and can even be used on a widget. Doesn't have to be on a login page.
  - You can reactively redirect on login by checking the `isAuthenticated` derived store. This is what the login page does.
- `$lib/gql/`
  - `schema.gql`, `setup.fql`, `urql.js`
- `login.svelte` - also acts as signup. Looking good 👩‍🍳 chef's kiss
- `.env.example` - public env variables only, remove .example to use
- `svelte.config.js` - vite config to alias web optimized GraphQL, b/c standard package is required for codegen introspection
- `codegen.yml.example` - optional introspection script config, expects Fauna any secret in your db (public works too)

## Config

- ❕ you must `initClient()` somewhere. Normally that's in `__layout`
- ⬆ update `setup.fql` login_user function's `ttl` to suit your desired access token expiry target. Default 30 days, which may be too long for most tastes'.
- you may want to disable SSR globally, and explicitly enable it on pages that're public

Refer to https://github.com/armchair-traveller/mlfkn for login backend. Very simple and easy to adapt to other serverless platforms.

### Legend

Comments in source code starting with these denote areas of configuration:

- `TODO` - required config/field. Some of it you might have to fill in or it might produce unexpected behavior / bad code
- `⚙` - :gear: emoji: optional config you can tweak to enable/disable or adjust.

Any other starting symbols follow default better-comments format.

### Setup

1. Create new Fauna database and in dashboard GraphQL panel upload `src/lib/gql/schema.gql`
2. In Shell panel, run `./setup.fql` commands, one block at a time.
3. Remove `.example` suffix from all root config files, replacing if necessary (you'll fill them in).
4. In Security panel, create server key, add secret to your login backend e.g.mlfkn
5. Add secret to your `codegen.yml`. Optional: Create a public role to use w/ it instead.
6. Run codegen script e.g. `npm gen`
7. Create Magic app. Add public key and login backend URLs to `.env`. Add Magic secret key to your login backend.

TODO: Check if any lacking steps

### Updating your schema

Upload schema: Fill in your server secret for the curl command (or just upload from dashboard)

```shell
curl -H 'Authorization: Bearer <FAUNA_SECRET>' https://graphql.fauna.com/graphql/import?mode=merge --data-binary "./src/lib/gql/merge.gql"
```

Then generate introspection for the schema: `npm gen`

## Flow

A refresh token flow is used where Magic manages email validation. However, the consumer doesn't have to manage sessions, cookies, or JWT pertaining to the refresh token. Magic does that for you but internally, if the auto-refresh option is turned on, it's using IndexedDB so you must be wary if you have potential XSS vulnerabilities. Though you really don't have much choice if your backend isn't on the same site and you want your app to work on privacy-focused browsers like Brave.

- `auth.js` store keeps auth info in memory
- Login -> Magic Link didToken -> Backend validate: didToken -> Backend response: Fauna access token -> Set/Save access token (store/localStorage)
- App init: load access token from localStorage.
  - `@urql/exchange-auth` silently manages refreshing on expiration or token invalidation (auth errors), logging out on failure to refresh
  - Refresh flow: Magic client gets didToken from existing session -> Login flow starting from Backend validation
  - The shorter lived the access token, the less risk. Best practice numbers range from 10m, 20m, 1hr (>8hrs/1d is typically used in refresh tokens, or if user's security is less of a concern).
  - Refresh token is basically didToken, which is retrieved by Magic. Essentially, Magic manages to persist the session over a long period.
    - Magic retrieves didToken, and basically another backend login is performed as backend validates didToken and returns new access token.

## Notes

- You can remove localStorage from the equation and not use cookies either... which will result in slightly better security (debatable) with slightly more cost.
  - However this means a new access token is generated on every page refresh or new tab. Because refresh token is not managed by the consumer, a hop of retrieving didToken via Magic introduces a slight delay (probably not a lot, maybe a couple hundred ms).
  - To do this, you'd have to rework the store logic `auth.js`, removing localStorage and adding Magic.user.isLoggedIn() to .isAuthenticated(), and set to always init defaults. As well as init refresh in `urql.js`.
  - It's a negligible benefit to security. Keeping short-lived access tokens in localStorage is completely normal and fine for production in a refresh token flow.
