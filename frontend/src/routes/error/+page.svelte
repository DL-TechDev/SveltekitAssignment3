<!---

<script>
  // Import `page` from `$app/stores` to get URL parameters
  import { page } from '$app/stores';

  // Subscribe to the page store to get the query parameters
  let message = '';
  $: {
    // Extract the message from the URL parameters
    message = new URLSearchParams($page.url.search).get('message') || 'An error occurred';
  }
  </script>
  
  <h1>{message}</h1>

-->

<script>
	import { page } from '$app/stores';
</script>

<h1>Error</h1>