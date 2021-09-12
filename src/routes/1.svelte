<script>
import { queryOp, mutationOp } from '$lib/gql/urql'
import { gql, operationStore, mutation, query } from '@urql/svelte'
const arm = query(
  operationStore(gql`
    query FindArmchair {
      findUserByID(id: 309417338272219713) {
        email
        _id
      }
    }
  `)
)
$: email = $arm.data?.findUserByID.email
const changeEmail = mutation(
  operationStore(gql`
    mutation ChangeEmail($email: String!) {
      partialUpdateUser(id: 309417338272219713, data: { email: $email }) {
        email
        _id
      }
    }
  `)
)
</script>

{#if email}
  <h1>
    {email}
  </h1>
{/if}

<button on:click={() => changeEmail({ email: 'I changed on another page' })}
  >Do da change</button
>

<a href="/" sveltekit:prefetch>Take me home</a>
