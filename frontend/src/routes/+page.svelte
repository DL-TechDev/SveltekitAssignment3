<script>
	import axios from 'axios';
	import { goto } from '$app/navigation'; // Import SvelteKit's goto function
	import { writable } from 'svelte/store';
	import Toast from '../components/Toast.svelte';
	import { addToast } from '../components/store';
	import { validateEmpty } from '../utils/validators';

	export const userStore = writable(null);
	let username = '';
	let password = '';
	let successMessage = '';
	let errorMessage = '';

	async function clearLogin() {
		username = '';
		password = '';
	}

	async function login () {
		try {
			//console.log('It is now posting');
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
				successMessage = 'Successful Login';
				addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 5000 // 5 seconds
				});
				goto('/AppList');
				//console.log(response.data);
			} else if (response.status === 400) {
				// Bad request
				errorMessage = 'Invalid Credentials';
				addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 5000 // 5 seconds
				});
				clearLogin();
				return;
			} else if (response.status === 404) {
				// Bad request
				errorMessage = 'Invalid Credentials';
				addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 5000 // 5 seconds
				});
				clearLogin();
				return;
			} else {
				errorMessage = 'Invalid Credentials';
				addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 5000 // 5 seconds
				});
				clearLogin();
				return;
			}
		} catch (error) {
			//console.error('Login error:', error);
			clearLogin();
			errorMessage = 'Invalid Credentials';
			addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 5000 // 5 seconds
			});
			clearLogin();
			return;
		}
	};

	function validatorFields() {
		console.log('Username: ', username);
		console.log('Password: ', password);
		if (!validateEmpty(username) || !validateEmpty(password)) {
			errorMessage = 'Invalid Credentials';
			addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 5000 // 5 seconds
			});
			goto('/');
		} else {
			console.log('We are in the login part');
			login();
		}
	}
</script>

<div class="login-container">
	<div class="sub-main">
		<form class="login-form" on:submit|preventDefault>
			<label for="username">Username: </label>
			<input type="text" id="username" bind:value={username} placeholder="Username" required /><br
			/><br />
			<label for="password">Password: </label>
			<input
				type="password"
				id="password"
				bind:value={password}
				placeholder="Password"
				required
			/><br /><br />
			<button on:click={validatorFields}>Login</button>
		</form>
	</div>
</div>
<div>
	<Toast />
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

	.error-message {
		color: red;
	}
</style>
