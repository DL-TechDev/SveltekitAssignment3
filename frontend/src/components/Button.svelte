<script>
  export let label = 'Button'; // Default label for the button
  export let onClick; // Action to perform when button is clicked
  export let type = 'button'; // Button type: 'button', 'submit', etc.
  export let disabled = false; // Disabled state
</script>

<style>
  button {
    padding: 8px;
    background-color: #007bff;
    color: white;
    border: none;
    border-radius: 5px;
    font-size: 10px;
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
  {label}
</button>