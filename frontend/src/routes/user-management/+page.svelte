<script lang="ts">
	import { writable } from 'svelte/store';
	import { onMount } from 'svelte';
	import { onDestroy } from 'svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation'; // Import SvelteKit's goto function
	import { invalidate } from '$app/navigation';

	let username = '';
	let password = '';
	let errorMessage = '';
	let successMessage = '';
	let pageName = 'User Profile';

	//let userList = [];
	let userList: user[] = [];
	let showAddGroupPopup = false; // Toggle popup
  	let newGroup = ''; // New group name input


	let user = {
		username: '',
		password: '',
		email: '',
		active: '1', // Default to 'Yes'
		group: 'User' // Default to 'Admin'
	};

	interface user {
		User_name: string;
		password: string;
		Email: string;
		Active: number;
		Group: string;
		id: number;
	};

	// Fetch user data on component mount
	//onMount(async () => {
	async function fetchUserList() {
		try {
			const response = await axios.get('http://localhost:3000/user/getall', {
				withCredentials: false // Set to true if credentials are needed
			});
			if (response.status === 200) {
				userList = response.data;

				userList = response.data.map((user: user, index: number) => ({
					...user,
					id: index + 1 // Simple incremental ID
				}));
				console.log('UserList: ', userList);
			} else {
				errorMessage = 'Unable to fetch data.';
				console.warn('Unexpected response status:', response.status);
				goto('/error');
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
			errorMessage = 'An error occurred while fetching user profiles.';
			goto('/error'); // Navigate to the error page
		}
	}

	// Call the function on component mount
	onMount(() => {
		fetchUserList();
	});

	let newUser = {
		username: '',
		password: '',
		email: '',
		active: '1', // Default to 'Yes'
		group: 'User' // Default to 'Admin'
	};

	async function clearAddUserFields(){
		newUser.username = '';
		newUser.password = '';
		newUser.email = '';
		newUser.active = '';
		newUser.group = '';
	};


	let editingUserId: number | null=null; // Track the user being edited

	// Functions
	// Edit user
	const editUser = (id: number) => {
		console.log('editUser');
		console.log(id);
		editingUserId = id; // enable the fields to be writable
	};

	// Cancel edit
	const cancelEdit = (id: number) => {
		editingUserId = null;
	};


	const updateUserInfo = async (id: number, user: user) => {
		console.log(user);
		try {
			const response = await axios.put(
				`http://localhost:3000/user/updatedetails`,
				{
					User_name: user.User_name,
					Password: user.password,
					Email: user.Email,
					Active: user.Active,
					Group_name: user.Group
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true // Include cookies with the request
				}
			);

			if (response.status == 200) {
				editingUserId = null;
				await fetchUserList();
				// Invalidate the route to re-fetch the data
				//invalidate(`userList`);
			} else {
				console.error('Failed to save user data', response.status);
			}
			// Redirect to user management page
			goto('/user-management');

			// Clear sensitive fields or handle them as needed
			user.password = ''; // Clear password after successful update
		} catch (error) {
			console.error('Error updating User Info', error);
		}
	};

	// Add new user
	const addUser = async () => {
		try {
			const response = await axios.post(
				'http://localhost:3000/user/create',
				{
					User_name: newUser.username,
					Password: newUser.password,
					Email: newUser.email,
					Active: newUser.active,
					Group_name: newUser.group
				},
				{
					headers: {
						'Content-Type': 'application/json'
						//Authorization: `Bearer ${localStorage.getItem('accessToken')}` // Send token if needed
					},
					withCredentials: true // Include cookies with the request
				}
			);

			// Clear the form and reload the user list
			successMessage = response.data.message || 'New User added successfully!';
			await clearAddUserFields();
			editingUserId = null;
			await fetchUserList();
			goto('/user-management');
		} catch (error) {
			console.error('Error adding user:', error);
		}
	};

	const toggleActive = (user: user) => {
		user.Active = user.Active === 1 ? 2 : 1; // Toggle between 1 (active) and 2 (inactive)
	};
</script>

<div class="user-management-header">
  <h1>User Management</h1>
</div>

<button class="add-group-btn" on:click={() => (showAddGroupPopup = true)}>Create New Group</button>

<table>
	<thead>
		<tr>
			<th>Username</th>
			<th>Password</th>
			<th>Email</th>
			<th>Active</th>
			<th>Group</th>
			<th>Actions</th>
		</tr>
	</thead>
	<tbody>
		<!--{#each userList as user (user.User_name)}-->
		{#each userList as user (user.id)}
			<tr>
				<td>{user.User_name}</td>
				<td class="password-col">
					{#if editingUserId == user.id}
						<input type="password" bind:value={user.password} />
					{:else}
						{'***'}
					{/if}
				</td>
				<td>
					{#if editingUserId == user.id}
						<input type="text" bind:value={user.Email} />
					{:else}
						{user.Email}
					{/if}
				</td>
				<td>
					{#if editingUserId == user.id}
						<select bind:value={user.Active}>
							<option value="1">Yes</option>
							<option value="2">No</option>
						</select>
					{:else if user.Active == 1}
						Yes
					{:else}
						No
					{/if}
				</td>
				<td>
					{#if editingUserId == user.id}
						<select bind:value={user.Group}>
							<option value="Admin">Admin</option>
							<option value="User">User</option>
						</select>
					{:else}
						{user.Group}
						<!--{#if user.Group && user.Group.length > 0}
                            {#each user.Group as group}
                                {group.Group}
                            {/each}
                        {:else}
                            {''}
                        {/if}-->
					{/if}
				</td>
				<td>
					{#if editingUserId === user.id}
						<div class="action-buttons">
							<!---<button on:click={() => updateUserInfo(user.id, user)}>Save</button>
							<button on:click={() => cancelEdit(user.id)}>Cancel</button>-->
							<a class="cancel-btn" on:click={() => cancelEdit(user.id)}>Cancel</a> | 
            				<a class="save-btn" on:click={() => updateUserInfo(user.id, user)}>Save</a>
						</div>
					{:else}
						<a class="edit-btn" on:click={() => editUser(user.id)}>Edit</a>
						<!---<button on:click={() => editUser(user.id)}>Edit</button>-->
					{/if}
				</td>
			</tr>
		{/each}
	</tbody>
</table>

<!-- Add New User Section -->
<h2>Add New User</h2>
<table class="user-table">
	<tbody>
		<tr>
			<td><input type="text" placeholder="Username" bind:value={newUser.username} /></td>
			<td><input type="password" placeholder="Password" bind:value={newUser.password} /></td>
			<td><input type="text" placeholder="Email" bind:value={newUser.email} /></td>
			<td>
				<select bind:value={newUser.active}>
					<option value="1">Yes</option>
					<option value="2">No</option>
				</select>
			</td>
			<td>
				<select bind:value={newUser.group}>
					<option value="Admin">Admin</option>
					<option value="User">User</option>
				</select>
			</td>
			<td><button on:click={addUser}>Add User</button></td>
		</tr>
	</tbody>
</table>

<!-- Add Group Popup -->
{#if showAddGroupPopup}
  <div class="popup">
    <h2>Add New Group</h2>
    <input type="text" placeholder="Group Name" bind:value={newGroup} />
    <div class="popup-buttons">
      <button on:click={() => (showAddGroupPopup = false)}>Close</button>
      <button on:click={""}>Create Group</button>
    </div>
  </div>
{/if}

<style>
	.user-management-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		background-color: #e0e0e0;
		padding: 10px;
	}

	table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 20px;
	}

	td,
	th {
		padding: 12px;
		border-bottom: 1px solid #ccc;
		text-align: left;
	}

	.add-group-btn {
		background-color: #007bff;
		color: white;
		padding: 10px;
		border: none;
		border-radius: 4px;
		cursor: pointer;
  	}



	input[type='text'],
	input[type='password'],
	select {
		width: 100%;
		padding: 5px;
	}
	button {
		padding: 5px 10px;
		margin: 5px;
	}
	.action-buttons {
		display: flex;
		gap: 10px;
	}

	input[type='text'],
	input[type='password'],
	select {
		width: 100%;
		max-width: 150px; /* Limit input box width */
		padding: 5px;
	}

	.password-col {
		max-width: 200px; /* Adjust width as needed */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.popup {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: white;
		padding: 20px;
		border: 1px solid #ccc;
		box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
		z-index: 10;
	}

	.popup-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 20px;
	}


</style>
