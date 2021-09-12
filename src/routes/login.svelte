<script>
import { goto } from '$app/navigation'
import { isAuthenticated, login } from '$lib/stores/auth'

let value, disabled, title, success
// If at any point the user is authenticated, before or after, redirect to main app
$: if ($isAuthenticated) goto('/') // TODO: Fill in page redirect after login success
async function submitLogin() {
  const email = value,
    loggingInMsg = 'Logging you in'
  disabled = true
  let numDots = 1
  const animatedMsg = () =>
    (title = value =
      `${loggingInMsg}${'.'.repeat(++numDots <= 3 ? numDots : (numDots = 1))}`)
  animatedMsg()
  const intervalDots = setInterval(animatedMsg, 1000)
  const payload = await login({ email })
  clearInterval(intervalDots)
  if (payload) success = value = "Success! We'll escort you right away."
  else {
    disabled = false
    value = email
    title = null
  }
  // Don't worry, no potential errors. It's just an email, and will redirect on success. Magic takes care of the validation.
}
</script>

<main class="min-w-full grid place-items-center min-h-screen">
  <form on:submit|preventDefault={submitLogin}>
    <input
      {title}
      class="border border-gray-300 p-4 py-3 rounded w-80 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow font-medium disabled:bg-gray-100 disabled:hover:border-none disabled:opacity-50 {success
        ? 'bg-green-700 text-white'
        : ''}"
      type="email"
      name="email"
      bind:value
      placeholder="Email Address"
      required
      {disabled}
    />
  </form>
</main>

<style>
input::placeholder {
  opacity: 0.45;
  font-weight: 400;
}
</style>
