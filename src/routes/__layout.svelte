<script>
import '../app.postcss'
import { initClient } from '$lib/gql/urql'
initClient()
</script>

<slot />
