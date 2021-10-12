<script context="module">
import { browser } from '$app/env'
import { restore } from '$lib/client'
import { queryOp } from '$lib/gql/urql'
import { client as clientStore } from '$lib/stores/client'
import { createClient, dedupExchange, cacheExchange, fetchExchange, ssrExchange, setClient, gql } from '@urql/svelte'
import { get } from 'svelte/store'

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
//console.log(op.fetching)
// console.log(op)
// op.update((v) => {
//   v.fetching = false
//   v.data = 'hi'
//   return v
// })

export async function load({ page, fetch, session, context }) {
  const browserClient = get(clientStore)
  console.log(browserClient)
  await browserClient.query(op.query).toPromise()
  // const ssr = ssrExchange({
  //   isClient: false,
  //   initialState: undefined,
  // })
  // const client = createClient({
  //   url: 'https://graphql.anilist.co',
  //   fetch,
  //   exchanges: [
  //     dedupExchange,
  //     cacheExchange,
  //     ssr, // Add `ssr` in front of the `fetchExchange`
  //     fetchExchange,
  //   ],
  // })

  // // TODO: Check CSR if we can do what we planned of using a browser-specific client and still have SSR working
  // // WAIT! This isn't possible because if you just have the data during SSR, it won't send it to the client.
  // // operation stores start with fetching = true.. but that doesn't help us.
  // // maybe check initial SSR?
  // // TODO: Also check if you can restore() after the first restore, on another page. We need a third page for that. The reason is, we need to restore() for the load function CSR to load data in before loading that page.
  //   await client
  //     .query(
  //       gql`
  //         {
  //           __typename
  //         }
  //       `
  //     )
  //     .toPromise()

  // console.log(client)
  return {
    props: {
      // urql: { client, data: ssr.extractData(), ssr },
    },
  }
}
</script>

<script>
console.log($clientStore)
// export let urql
// const { data } = urql
// restore(data)
const op2 = queryOp(gql`
  {
    __schema {
      __typename
    }
  }
`)

//browser && ssr.restoreData(data)

//setTimeout(() => op.reexecute({ requestPolicy: 'network-only' }), 3000)

//$: console.log($op2)

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
<a sveltekit:prefetch href="/csr">prefetch csr</a>

{JSON.stringify($op)}
