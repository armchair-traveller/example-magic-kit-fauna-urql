// import { auth, isAuthenticated, login, logout } from '$lib/stores/auth'
import { authExchange } from '@urql/exchange-auth'
import {
  initClient as urqlInit,
  dedupExchange,
  makeOperation,
  fetchExchange,
  operationStore,
  query,
  mutation,
} from '@urql/svelte'
import { get } from 'svelte/store'
// import { devtoolsExchange } from '@urql/devtools' // ⚙ for dev only

/** Fauna & Magic Link preconfigured urql client */

// Utils

/** Generates operation store function combo creation functions */
const opFn =
  (queryFn) =>
  /** @typedef {import('@urql/svelte/dist/types').OperationStore} OperationStore
   * @returns {OperationStore} Query func operation store combo. You can subscribe to it or call to query,  */
  (
    gql // intentionally omit taking variables into the opStore b/c there doesn't seem to be a use case
    // ? but if you think of one you can add it in later
  ) =>
    Object.defineProperties(function q(variables) {
      return queryFn(q, variables)
    }, Object.getOwnPropertyDescriptors(operationStore(gql)))

/** Query Operation Store: Creates a query function store from a gql query.
 *
 * usage detailed in https://waa.ai/gist-urql-patterns */
export const queryOp = opFn(query)
/** Mutation Operation Store: Creates a mutation function store from a gql query */
export const mutationOp = opFn(mutation)
