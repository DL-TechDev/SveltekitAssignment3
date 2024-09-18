<script lang='ts'>
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let onClick: () => void;
  export let disabled = false; // Disabled state
  export let label: string;
</script>

<style>
  button {
    padding: 8px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 15px;
    cursor: pointer;
  }

  button:hover {
    background-color: #0056b3;
  }

  button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
</style>

<button type={type} on:click={onClick} disabled={disabled}>
  <slot>{label}</slot>
</button>