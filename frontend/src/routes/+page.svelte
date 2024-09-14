<script>
	import axios from 'axios';
	import { goto } from '$app/navigation'; // Import SvelteKit's goto function

	let username = '';
	let password = '';
	let errorMessage = '';

	async function clearLogin() {
		username = '';
		password = '';
	}

	const login = async () => {
		try {
			const response = await axios.post(
				'http://localhost:3000/auth/login',
				{
					User_name: username,
					Password: password
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true // Ensure cookies are included in requests
				}
			);

			if (response.status === 200) {
				goto('/profile');
			} else if (response.status === 400) {
				// Bad request
				errorMessage = 'An unexpected error occurred. Please try again.';
				clearLogin();
			} else {
				errorMessage = 'Invalid Credentials';
				clearLogin();
			}
		} catch (error) {
			//console.error('Login error:', error);
			clearLogin();
			errorMessage = 'An unexpected error occurred. Please try again.';
		}
	};
</script>

<div class="login-container">
	<div class="sub-main">
		<form class="login-form" on:submit|preventDefault>
			<label for="username">Username: </label>
			<input
				type="username"
				id="username"
				bind:value={username}
				placeholder="Username"
				required
			/><br /><br />
			<label for="password">Password: </label>
			<input
				type="password"
				id="password"
				bind:value={password}
				placeholder="Password"
				required
			/><br /><br />
			<button on:click={login}>Login</button>
      {#if errorMessage}
			  <p class="error-message">{errorMessage}</p>
		  {/if}
		</form>

	</div>
</div>

<style>
	.login-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100vh;
		background-color: #f5f5f5;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		width: 300px;
		padding: 2rem;
		background-color: white;
		border-radius: 10px;
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	}

	label {
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}

	input {
		padding: 10px;
		margin-bottom: 1rem;
		border: 1px solid #ccc;
		border-radius: 5px;
		font-size: 1rem;
	}

	button {
		padding: 10px;
		background-color: #007bff;
		color: white;
		border: none;
		border-radius: 5px;
		font-size: 1rem;
		cursor: pointer;
	}

	button:hover {
		background-color: #0056b3;
	}

  .error-message{
    color: red;
  }
</style>
