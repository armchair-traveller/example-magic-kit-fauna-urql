import {
  createClient,
  dedupExchange,
  cacheExchange,
  fetchExchange,
  ssrExchange,
  initClient as urqlInit,
} from '@urql/svelte'
import { client as clientStore } from './stores/client'
const ssr = ssrExchange({
  isClient: true,
  initialState: undefined,
})
export const restore = ssr.restoreData

export function initClient() {
  const client = urqlInit({
    url: 'https://graphql.anilist.co',
    exchanges: [
      dedupExchange,
      cacheExchange,
      ssr, // Add `ssr` in front of the `fetchExchange`
      fetchExchange,
    ],
  })
  clientStore.set(client)
  return client
}

const loadSsr = ssrExchange({
  isClient: false,
  initialState: undefined,
})
export const extractData = loadSsr.extractData
export function createLoadClient(fetch) {
  return createClient({
    url: 'https://graphql.anilist.co',
    fetch,
    exchanges: [
      dedupExchange,
      cacheExchange,
      loadSsr, // Add `ssr` in front of the `fetchExchange`
      fetchExchange,
    ],
  })
}
