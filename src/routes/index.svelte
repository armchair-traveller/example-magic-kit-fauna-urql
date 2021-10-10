<script context="module">
import { browser } from '$app/env'
import { queryOp } from '$lib/gql/urql'
import { createClient, dedupExchange, cacheExchange, fetchExchange, ssrExchange, setClient, gql } from '@urql/svelte'

// The `ssrExchange` must be initialized with `isClient` and `initialState`

// const client = createClient({
//   url: 'https://graphql.anilist.co',
//   // url: 'https://graphql.fauna.com/graphql',
//   exchanges: [
//     dedupExchange,
//     cacheExchange,
//     ssr, // Add `ssr` in front of the `fetchExchange`
//     fetchExchange,
//   ],
// })

let op = queryOp(gql`
  {
    __typename
  }
`)

// op.update((v) => {
//   v.fetching = false
//   v.data = 'hi'
//   return v
// })

// export async function load({ page, fetch, session, context }) {
//   // const ssr = ssrExchange({
//   //   isClient: browser,
//   //   initialState: browser ? window.__URQL_DATA__ : undefined,
//   // })
//   const ssr = ssrExchange({
//   isClient: browser,
//   initialState: browser ? window.__URQL_DATA__ : undefined,
// })
//   const client = createClient({
//     url: 'https://graphql.anilist.co',
//     fetch,
//     exchanges: [
//       dedupExchange,
//       cacheExchange,
//       ssr, // Add `ssr` in front of the `fetchExchange`
//       fetchExchange,
//     ],
//   })

//   const articles = await client
//     .query(
//       gql`
//         {
//           __typename
//         }
//       `
//     )
//     .toPromise()

//   console.log(articles)
//   // console.log(client)

//   return {
//     props: {
//       client,
//     },
//   }
// }
</script>

<script>
// setClient(client)
// op()
const ssr = ssrExchange({
  isClient: browser,
  initialState: browser ? window.__URQL_DATA__ : undefined,
})
const client = createClient({
  url: 'https://graphql.anilist.co',
  fetch,
  exchanges: [
    dedupExchange,
    cacheExchange,
    ssr, // Add `ssr` in front of the `fetchExchange`
    fetchExchange,
  ],
})
// export let client
setClient(client)
browser && ssr.restoreData(window.__URQL_DATA__)
op()
console.log($op)
// console.log(opResult)
// $op.data = 'hi'
// $op.fetching = false
// console.log($op)
// ;(async function () {
//   let v = await client
//     .query(
//       gql`
//         {
//           __typename
//         }
//       `
//     )
//     .toPromise()

//   // console.log(v)
// })()
// op()
// $op.fetching = false
// console.log($op)
</script>
