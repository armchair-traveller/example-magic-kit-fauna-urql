import { auth, isAuthenticated, logout, refresh } from '$lib/stores/auth'
import { authExchange } from '@urql/exchange-auth'
import {
  initClient as urqlInit,
  dedupExchange,
  cacheExchange,
  makeOperation,
  fetchExchange,
  operationStore,
  query,
  mutation,
} from '@urql/svelte'
import { get } from 'svelte/store'
// import { devtoolsExchange } from "@urql/devtools"; // * for dev only

/** Fauna & Magic Link preconfigured urql client */
export const initClient = () =>
  urqlInit({
    url: 'https://graphql.fauna.com/graphql',
    exchanges: [
      // devtoolsExchange, // * for dev only
      dedupExchange,
      cacheExchange,
      // auth exchange quick start https://github.com/FormidableLabs/urql/tree/main/exchanges/auth#quick-start-guide
      authExchange({
        addAuthToOperation: ({ authState, operation }) => {
          // Nothing to change, return the operation without changes
          if (
            !authState ||
            !authState?.token
            // Do nothing if no public key // && !import.meta.env.VITE_FAUNA_PUBLIC
          )
            return operation

          // FetchOptions can be a function (See Client API) but you can simplify this based on usage
          const fetchOptions =
            typeof operation.context.fetchOptions == 'function'
              ? operation.context.fetchOptions()
              : operation.context.fetchOptions || {}

          return makeOperation(operation.kind, operation, {
            ...operation.context,
            fetchOptions: {
              ...fetchOptions,
              headers: {
                ...fetchOptions.headers,
                Authorization: `Bearer ${
                  authState?.token // || import.meta.env.VITE_FAUNA_PUBLIC//* uncomment to use a public key if not logged in
                }`,
                'X-Schema-Preview': 'partial-update-mutation',
              },
            },
          })
        },
        willAuthError: ({ authState }) => {
          // e.g. check for expiration, existence of auth etc
          if (!authState || !get(isAuthenticated)) return true
          return false
        },
        didAuthError: ({ error }) => {
          // Check if error was an auth error (can be implemented in various ways, e.g. 401 or a special error code)
          return error.message == '[GraphQL] Invalid database secret.' // Auth error when secret invalid, possibly b/c
          //                                                              of expired or force logout on other devices
        },
        // This func can be async
        getAuth: async ({ authState }) => {
          // No refresh token, refer to auth exchange quickstart for that

          // For initial launch, fetch the auth state from storage (local storage, async storage, in-memory etc)
          if (!authState) {
            const authState = get(auth)
            if (authState.token) return authState
            // Can also implement redirect logic here if desired, but it's better to place that logic at the component
            // level, which can even be dynamically imported.
            return null
          }

          // The following code gets executed when an auth error has occurred

          // ***===***
          // Refresh Logic
          // refresh if possible & return new auth state
          // * Uncomment and update ttl of login FQL func in setup.fql to disable
          //   To get more security with refresh (no localStorage), check out the README
          const payload = await refresh()
          if (payload) return payload // return new auth state
          // otherwise refresh failed
          // ***===***

          // Your app logout logic should trigger here
          await logout()

          return null
        },
      }),
      fetchExchange,
    ],
  })
