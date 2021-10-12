<script context="module">
import { browser } from '$app/env'
import { client as browserClient, restore } from '$lib/client'
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
// console.log(op)
// op.update((v) => {
//   v.fetching = false
//   v.data = 'hi'
//   return v
// })

export async function load({ page, fetch, session, context }) {
  const ssr = ssrExchange({
    isClient: false,
    initialState: undefined,
  })
  const client = browser
    ? browserClient
    : createClient({
        url: 'https://graphql.anilist.co',
        fetch,
        exchanges: [
          dedupExchange,
          cacheExchange,
          ssr, // Add `ssr` in front of the `fetchExchange`
          fetchExchange,
        ],
      })

  if (!op.data)
    await client
      .query(
        gql`
          {
            __typename
          }
        `
      )
      .toPromise()

  console.log(client)
  return {
    props: {
      urql: { client, data: ssr.extractData(), ssr },
    },
  }
}
</script>

<script>
export let urql
const { data } = urql
// console.log(data)
const op2 = queryOp(gql`
  {
    __schema {
      __typename
    }
  }
`)

//op2()
//browser && ssr.restoreData(data)

// setClient(client)
// op()

// export let client
op()
console.dir(op, 'hi')
setTimeout(() => op.reexecute({ requestPolicy: 'network-only' }), 3000)

$: console.log($op2)
// $: console.log($op)
// console.log(client)
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

<a sveltekit:prefetch href="/ssr">prefetch ssr</a>

{JSON.stringify($op)}
