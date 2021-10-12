import { writable } from 'svelte/store'

let client = null

// minimal client for SSR purposes only. Runs in browser only for initial rehydration of SSR.
ssrClient
// TODO: Check contents of client. It'll only be populated once initclient is called. Initial load, even on client, will
// run before any component code (this is true for all components, the load function, regardless page/layout will run before
// any other component loads, on initial load... as long as the page/layout isn't being dynamically loaded.)

// in init client, change client to the result of initclient (the new client that has init in the browser)

// perhaps we'll abstract it all into one function, maybe call it loadQueries(fetch, queryOp1, queryOp2)
// also consider allowing gql tag if there's a use for it, though I think just passing operationStores should be fine
//
