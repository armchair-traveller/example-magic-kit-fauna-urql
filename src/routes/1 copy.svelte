<script>
import { queryOp, mutationOp } from '$lib/gql/urql'
import { gql } from '@urql/svelte'
const arm = queryOp(gql`
  query FindArmchair {
    result: findUserByID(id: 309417338272219713) {
      email
      _id
    }
  }
`)()
$: email = $arm.data?.result.email
const changeEmail = mutationOp(gql`
  mutation ChangeEmail($email: String!) {
    partialUpdateUser(id: 309417338272219713, data: { email: $email }) {
      email
      _id
    }
  }
`)()
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
