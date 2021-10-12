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
op.variables = 'hi'
console.dir(op)
// console.log(op)
// op.update((v) => {
//   v.fetching = false
//   v.data = 'hi'
//   return v
// })

export async function load({ page, fetch, session, context }) {
  const ssr = ssrExchange({
    isClient: true,
    initialState: undefined,
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
  const articles = await client
    .query(
      gql`
        {
          __typename
        }
      `
    )
    .toPromise()

  console.log(ssr.extractData())
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

const ssr = ssrExchange({
  isClient: browser,
  initialState: browser ? data : undefined,
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
// console.log(data)
setClient(client)
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
console.dir(op)
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

<a sveltekit:prefetch href="/">prefetch index</a>
