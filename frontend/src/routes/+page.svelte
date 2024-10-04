<script>
	import axios from 'axios';
	import { goto } from '$app/navigation'; // Import SvelteKit's goto function
	import { writable } from 'svelte/store';
	import Toast from '../components/Toast.svelte';
	import { addToast } from '../components/store';
	import { validateEmpty } from '../utils/validators';

	export const userStore = writable(null);
	let uName = '';
	let uPassword = '';
	let successMessage = '';
	let errorMessage = '';

	async function clearLogin() {
		uName = '';
		uPassword = '';
	}

	async function login () {
		try {
			//console.log('It is now posting');
			const response = await axios.post(
				'http://localhost:3000/auth/login',
				{
					User_name: uName,
					Password: uPassword
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
					message: successMessage,
					type: 'success',
					dismissible: true,
					timeout: 1000
				});
				goto('/AppList');
				//console.log(response.data);
			} 
			// else if(response.status >= 400){
			// 	errorMessage = 'Invalid Credentials';
			// 	addToast({
			// 		message: errorMessage,
			// 		type: 'error',
			// 		dismissible: true,
			// 		timeout: 1000 
			// 	});
			// 	clearLogin();
			// 	goto('/');
			// }
			// else {
			// 	errorMessage = 'Invalid Credentials';
			// 	addToast({
			// 		message: errorMessage,
			// 		type: 'error',
			// 		dismissible: true,
			// 		timeout: 1000 
			// 	});
			// 	clearLogin();
			// 	goto('/');
			// }
		} catch (error) {
			//console.error('Login error:', error);
			clearLogin();
			errorMessage = 'Invalid Credentials';
			addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 1000
			});
			clearLogin();
			goto('/');
		}
	};

	function validatorFields(uName,uPassword) {
		console.log('Username: ', uName);
		console.log('Password: ', uPassword);
		if (validateEmpty(uName) || validateEmpty(uPassword)) {
			errorMessage = 'Invalid Credentials5';
			// addToast({
			// 	message: errorMessage,
			// 	type: 'error',
			// 	dismissible: true,
			// 	timeout: 1000
			// });
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
			<input type="text" id="username" bind:value={uName} placeholder="Username" required /><br
			/><br />
			<label for="password">Password: </label>
			<input
				type="password"
				id="password"
				bind:value={uPassword}
				placeholder="Password"
				required
			/><br /><br />
			<button on:click={validatorFields(uName,uPassword)}>Login</button>
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
