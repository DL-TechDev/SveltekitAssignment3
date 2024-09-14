<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	import TopNavBar from '../../components/TopNavBar/+page.svelte';
  	import Button from '../../components/Button.svelte';

	let username = '';
	let email = '';
	let password = '';
	let newEmail = '';
	let newPassword = '';
	let successMessage = '';
	let errorMessage = '';
	let pageName = 'User Profile';
	onMount(async () => {
		try {
			const response = await axios.get('http://localhost:3000/user/profile', {
				withCredentials: true
			});
			console.log('User profile:', response.data);

			/*
			if (response) {
				const data = await response.data;
				// assign name and email data
				username = data[0].User_name;
				email = data[0].Email;*/

			 if (response.status === 200) {
					const data = response.data;

					// Assign name and email data securely
					username = data.username;
					email = data.email;
			} else {
				// unable to fetch data
				goto('/error');
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
			errorMessage = 'An error occurred while fetching user profile.';
			goto('/error'); // Use goto for navigation
		}
	});

	const updateEmail = async () => {
		try {
			const response = await axios.put(
				'http://localhost:3000/user/update-email',
				{
					User_name: username,
					Email: newEmail
				},
				{
					headers: {
						'Content-Type': 'application/json'
						//Authorization: `Bearer ${localStorage.getItem('accessToken')}` // Send token if needed
					},
					withCredentials: true // Include cookies with the request
				}
			);
			goto('/profile'); // Use goto for navigation

			// Assuming the response has a message field
			successMessage = response.data.message || 'Email updated successfully!';
			email = newEmail;
			newEmail = ''; // Clear the input field after successful update
		} catch (error) {
			console.error('Error updating email:', error);
		}
	};

	const updatePassword = async () => {
		try {
			const response = await axios.put(
				'http://localhost:3000/user/update-password',
				{
					User_name: username,
					Password: newPassword
				},
				{
					headers: {
						'Content-Type': 'application/json'
						//Authorization: `Bearer ${localStorage.getItem('accessToken')}` // Send token if needed
					},
					withCredentials: true // Include cookies with the request
				}
			);
			goto('/profile'); // Use goto for navigation

			// Assuming the response has a message field
			successMessage = response.data.message || 'Password updated successfully!';
			password = newPassword;
			newPassword = ''; // Clear the input field after successful update
		} catch (error) {
			console.error('Error updating password:', error);
		}
	};
</script>

<div class="main">
	<TopNavBar {pageName} {username} />
	<slot />
	<!-- This is where page content will be rendered -->
	<p>Username: {username}</p>
	<p>email: {email}</p>

	<div class="updateEmail">
		<h3>Update Email</h3>
		<form on:submit|preventDefault>
			<label for="newEmail" class="labelName">New email: </label>
			<input
				type="email"
				bind:value={newEmail}
				placeholder="New Email"
				aria-label="New Email"
			/><br />
			<Button label="Update email" onClick={updateEmail}>Update Email</Button>
		</form>
	</div>

	<div class="updatePassword">
		<h3>Update Password</h3>
		<form on:submit|preventDefault>
			<label for="newPassword" class="labelName">New Password: </label>
			<input
				type="password"
				bind:value={newPassword}
				placeholder="New Password"
				aria-label="New Password"
			/><br />
			<Button label="Change password" onClick={updatePassword}>Change password</Button>
		</form>
	</div>
	{#if successMessage}
		<p class="success-message">{successMessage}</p>
	{/if}

	{#if errorMessage}
		<p class="error-message">{errorMessage}</p>
	{/if}
</div>

<style>
	.success-message {
		color: green;
		font-weight: bold;
	}

	.error-message {
		color: red;
		font-weight: bold;
	}
</style>