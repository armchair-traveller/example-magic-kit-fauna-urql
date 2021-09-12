<script>
import { goto } from '$app/navigation'
import { isAuthenticated, login } from '$lib/stores/auth'
import { Magic } from 'magic-sdk' // Static import Magic. Even if dynamic, will be tree shaken & cached, interchangeably.

let value, disabled, title, success, error
// If at any point the user is authenticated, before or after, redirect to main app
$: if ($isAuthenticated) goto('/') // TODO: Fill in page redirect after login success
async function submitLogin() {
  error &&= false // reset error on submit
  const email = value,
    loggingInMsg = 'Logging you in'
  disabled = true
  let numDots = 1
  const animatedMsg = () =>
    (title = value =
      `${loggingInMsg}${'.'.repeat(++numDots <= 3 ? numDots : (numDots = 1))}`)
  animatedMsg()
  const intervalDots = setInterval(animatedMsg, 1000)
  const magic = new Magic(import.meta.env.VITE_MAGIC_PUBLIC)
  const payload = await login({ email, magic })
  clearInterval(intervalDots)
  // It's just an email, and will redirect on success. Magic takes care of the validation.
  if (payload) success = value = "Success! We'll escort you right away."
  // Only error possible is network.
  else {
    disabled = title = null
    error = value = email
  }
}
</script>

<main class="min-w-full grid place-items-center min-h-screen">
  <form
    class="mt-1 relative rounded-md shadow-sm"
    on:submit|preventDefault={submitLogin}
  >
    <input
      {title}
      class="border border-gray-300 p-4 py-3 rounded w-80 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow font-medium disabled:bg-gray-100 disabled:hover:border-gray-300 disabled:opacity-50 {success
        ? 'bg-green-700 text-white'
        : error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500 hover:border-red-500'
        : ''}"
      type="email"
      name="email"
      bind:value
      placeholder="Email Address"
      required
      {disabled}
      aria-invalid={error ? true : null}
      aria-describedby={error ? 'network-error' : null}
    />
    <div
      class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
      class:hidden={!error}
    >
      <!-- Heroicon name: solid/exclamation-circle -->
      <svg
        class="h-5 w-5 text-red-500"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clip-rule="evenodd"
        />
      </svg>
    </div>
    <p
      class="absolute mt-2 text-sm text-red-600 transition-all"
      class:hidden={!error}
      id="network-error"
    >
      Server error encountered! Please try again later. We appreciate your
      patience while we resolve this.
    </p>
  </form>
</main>

<style>
input::placeholder {
  opacity: 0.45;
  font-weight: 400;
}
</style>
