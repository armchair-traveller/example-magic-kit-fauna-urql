<script>
import { mutationOp, queryOp } from '$lib/gql/urql'
import { gql } from '@urql/svelte'
//import { isAuthenticated } from '$lib/stores/auth'
// console.log($isAuthenticated)
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

<a href="/login" sveltekit:prefetch>Login</a>
{#if email}
  <h1>
    {email}
  </h1>
{/if}

<button on:click={() => changeEmail({ email: 'I changed on home' })}
  >Do da change</button
>

<a href="/1" sveltekit:prefetch>Take me to another page</a>
