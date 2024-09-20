<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	//import TopNavBar from '../../components/NavBar.svelte';
	import TopNavBar from '../../components/NavBar.svelte';
	import Button from '../../components/Button.svelte';
	import { addToast } from '../../components/store';
	import Toasts from '../../components/Toast.svelte';
	import { validatePassword, validateEmail } from '../../utils/validators.js';


	let username = '';
	let email = '';
	let password = '';
	let newEmail = '';
	let newPassword = '';
	let successMessage = '';
	let errorMessage = '';
	let pageName = 'User Profile';
	let isAdmin=false;
	let groupname='Admin';
	let activeStatus;

	//export async function GetProfile () {
	onMount(async () => {
		try {
			const response = await axios.get('http://localhost:3000/user/profile', {
				withCredentials: true
			});
			//console.log('User profile:', response.data);

			if (response.status === 200) {
				const data = response.data[0];

				// Assign name and email data securely
				username = data.User_name;
				email = data.Email;
				activeStatus= data.Active;

				console.log("Active: ",activeStatus)
				checkgroup(username,groupname);
			} else {
				// unable to fetch data
				goto('/');
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
			errorMessage = 'An error occurred while fetching user profile.';
			goto('/'); // Use goto for navigation
		}
		if (activeStatus===0) {
			console.log('Inactive Account');
			goto('/');
		}
	});

	export async function checkgroup (username, groupname) {
    //const isInGroup
		try {
			const response = await axios.get(
				'http://localhost:3000/user/user-group-name',{
        params: { User_name: username }, // Use 'params' to pass query parameters
        withCredentials: true // Include cookies with the request
      });
        if (response.status === 200) {
              //console.log("We are in the response status 200");
              const data = response.data;
              if (Array.isArray(data)) 
              {
                // Check if any of the group's names match the provided group name
                const isInGroup = data.some(group => group.Group_name === groupname);
                if(isInGroup)
              {
                  isAdmin=true;
                  return true;
              }
              } else 
              {
                console.error('Unable to check data');
                return false; // Return false 
                }
        } else {
            // unable to fetch data
            goto('/error');
        }
    } catch (error) {
			console.error('Error fetching profile:', error);
			//errorMessage = 'An error occurred while fetching user profile.';
			goto('/error'); // Use goto for navigation
		}
	}

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
			if(response.status==200)
			{
			

			// Assuming the response has a message field
			successMessage = response.data.message || 'Email updated successfully!';
			addToast({
				message: successMessage,
				type: 'success',
				dismissible: true,
				timeout: 3000
			});

			email = newEmail;
			newEmail = ''; // Clear the input field after successful update
			goto('/profile'); // Use goto for navigation
			}
			else{
			goto('/');
			}
			
		} catch (error) {
			console.error('Error updating email:', error);
		}
	};

	function checkPassword(){
		//console.log(newPassword);
		if(validatePassword(newPassword)){
			updatePassword();
		} else {
			errorMessage='Password must be 8-10 characters long and include letters, numbers, and special characters.';
			addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 3000
			});
			newPassword = '';
		}
	}

	function checkEmail(){
		//console.log(newEmail);
		if(validateEmail(newEmail)){
			updateEmail();
		} else {
			errorMessage='Invalid Email Format';
			addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 3000
			});
			newEmail = '';
		}
	}


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
			addToast({
				message: successMessage,
				type: 'success',
				dismissible: true,
				timeout: 3000 // 10 seconds
			});
			
			password = newPassword;
			newPassword = ''; // Clear the input field after successful update
		} catch (error) {
			console.error('Error updating password:', error);
		}
	};

	// Call the function on component mount
	//onMount(() => {
	//	GetProfile ();
	//});
</script>

<TopNavBar {pageName} {username} {isAdmin}/>
<div class="main">
	<div class="user-details">
		<h2>User details</h2>
		<p>Username: {username}</p>
		<p>Email: {email}</p>
	</div>
	<div class="update-section">
		<div class="updateEmail">
			<h3>Update Email</h3>
			<form id="emailProfileForm" on:submit|preventDefault>
				<label for="newEmail" class="labelName">New email: </label>
				<input
					id="newEmail"
					type="email"
					bind:value={newEmail}
					placeholder="New Email"
					aria-label="New Email"
				/><br />
				<Button label="Update email" onClick={checkEmail}>Update Email</Button>
			</form>
		</div>

		<div class="updatePassword">
			<h3>Update Password</h3>
			<form id="passwordProfileForm" on:submit|preventDefault>
				<label for="newPassword" class="labelName">New Password: </label>
				<input
					id="newPassword"
					type="password"
					bind:value={newPassword}
					placeholder="New Password"
					aria-label="New Password"
				/><br />
				<Button label="Change password" onClick={checkPassword}>Change password</Button>
			</form>
		</div>
	</div>
</div>
	<Toasts />
<style>
	.main {
		display: flex;
		flex-direction: column; /* Stack the content vertically */
		align-items: center; /* Center horizontally */
		min-height: 10px; /* Make the container take full viewport height */
		justify-content: flex-start; /* Space between content to push footer to bottom */
	}
	.updateEmail form,
	.updatePassword form {
		text-align: right; /* Align the buttons to the right */
	}

	.success-message {
		color: green;
		font-weight: bold;
	}

	.error-message {
		color: red;
		font-weight: bold;
	}
</style>
