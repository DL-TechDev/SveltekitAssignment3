<script>
  import { toasts } from './store.js'; // Import the store
  import { onDestroy } from 'svelte';

  // Bind to the `toasts` store to reactively get the toasts list
  let toastList = [];
  const unsubscribe = toasts.subscribe(value => {
    console.log(value);
    toastList = value;
  });

  // Clean up the subscription when the component is destroyed
  onDestroy(() => {
    unsubscribe();
  });

  const removeToast = (id) => {
    toasts.update((allToasts) => allToasts.filter(toast => toast.id !== id));
  };
</script>

<div class="toast-container">
  {#each toastList as toast (toast.id)}
    <div class="toast {toast.type}">
      <p>{toast.message}</p>
    </div>
  {/each}
</div>

<style>
  .toast-container {
    position: fixed;
    bottom: 20px;
    left: 20px;
    display: flex;
    gap: 10px;
  }

  .toast {
    background-color: #28a745; /* Success green background */
    color: white;
    padding: 15px;
    border-radius: 10px; /* Rounded corners */
    box-shadow: 0px 2px 10px rgba(0, 0, 0, 0.2);
    font-size: 16px;
    min-width: 120px;
  }

  .toast.success {
    background-color: #28a745;
  }

  .toast.error {
    background-color: #dc3545;
  }

  .toast.info {
    background-color: #17a2b8;
  }
</style>
