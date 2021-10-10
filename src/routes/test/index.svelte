<script>
// import { goto } from '$app/navigation'
// import { isAuthenticated, login } from '$lib/stores/auth'
import { Magic } from 'magic-sdk' // Static import Magic. Even if dynamic, will be tree shaken & cached, interchangeably.
import { OAuthExtension } from '@magic-ext/oauth'

let value, disabled, title, success, errorMsg
// If at any point the user is authenticated, before or after, redirect to main app
//$: if ($isAuthenticated) goto('/') // TODO: Fill in page redirect after login success
async function submitLogin() {
  const magic = new Magic(import.meta.env.VITE_MAGIC_PUBLIC, {
    extensions: [new OAuthExtension()],
  })
  await magic.oauth.loginWithRedirect({
    provider: 'github' /* 'google', 'facebook', 'apple', or 'github' */,
    redirectURI: 'http://localhost:3000/test',
    scope: ['user:email'] /* optional */,
  })
}
;(async function confirmOauth() {
  let magic = new Magic(import.meta.env.VITE_MAGIC_PUBLIC, {
    extensions: [new OAuthExtension()],
  })
  console.log(await magic.oauth.getRedirectResult(), await magic.user.isLoggedIn(), await magic.user.getIdToken())
})()
</script>

<main class="min-w-full grid place-items-center min-h-screen">
  <form class="mt-1 relative rounded-md shadow-sm" on:submit|preventDefault={submitLogin}>
    <input
      class="border border-gray-300 p-4 py-3 rounded w-80 hover:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-shadow font-medium disabled:bg-gray-100 disabled:hover:border-gray-300 disabled:opacity-50"
      type="email"
      name="email"
      bind:value
      placeholder="Email Address"
      required
    />
    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
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
  </form>

  <button
    on:click={async () => {
      const magic = new Magic(import.meta.env.VITE_MAGIC_PUBLIC, {
        extensions: [new OAuthExtension()],
      })
      await magic.oauth.loginWithRedirect({
        provider: 'github' /* 'google', 'facebook', 'apple', or 'github' */,
        redirectURI: 'http://localhost:3000/test',
        scope: ['user:email'] /* optional */,
      })
    }}>Login GitHub</button
  >
</main>

<style>
input::placeholder {
  opacity: 0.45;
  font-weight: 400;
}
</style>
