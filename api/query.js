import { createClient, fetchExchange } from '@urql/core'

const client = createClient({
  url: 'https://graphql.fauna.com/graphql',
  exchanges: [fetchExchange], // we never send duplicate queries, we also do not need caching
  fetchOptions: {
    headers: {
      Authorization: `Bearer ${MLF_FAUNA_SECRET}`,
      'X-Schema-Preview': 'partial-update-mutation',
    },
  },
})

export function query(query, variables) {
  return client.query(query, variables).toPromise()
}

export function mutation(query, variables) {
  return client.mutation(query, variables).toPromise()
}
