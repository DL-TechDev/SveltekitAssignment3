<script lang="ts">
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	//import TopNavBar from '../../components/NavBar.svelte';
	import TopNavBar from '../../components/NavBar.svelte';
	import Popup from '../../components/PopUp/+page.svelte';
	import Toast from '../../components/Toast.svelte';
	//import { createEventDispatcher } from 'svelte';
	import { addToast } from '../../components/store';
	import MultiSelect from 'svelte-multiselect';
	import {
		validatePassword,
		validateEmail,
		validateEmpty,
		validateGroupName
	} from '../../utils/validators.js';

	//const dispatch = createEventDispatcher();

	let username = '';
	let groupname = '';
	let errorMessage = '';
	let successMessage = '';
	let pageName = 'User Management';
	let activeStats: number;

	let editingUserId: number | null = null; // Track the user being edited

	let userList: user[] = []; // list to hold the list of user objects
	let groups: string[] = []; // list to hold the list of groups

	//let editing = null;

	interface Group {
		Group_name: string;
	}

	// user object to be used in the userList
	let user = {
		username: '',
		password: '',
		email: '',
		active: '1', // Default to 'Yes'
		group: []
	};

	interface user {
		User_name: string;
		password: string;
		Email: string;
		Active: number;
		Group: string[];
		id: number;
	}

	// onChnage Flags to check if fields are touched
	let emailChange = false;
	let passChange = false;
	let activeChange = false;
	let groupChange = false;

	// this is to indicate flags when any of the user's field is edited.
	let editPass;
	let editEmail;
	let editActive;
	let editGroup = [];

	async function getUser() {
		try {
			// get the group this user is in
			const responseGetGrpName = await axios.get('http://localhost:3000/user/GroupName', {
				withCredentials: true
			});

			if (responseGetGrpName.status === 200) {
				const data = responseGetGrpName.data[0];
				//console.log(data);
				// Assign username and groupName
				username = data.User_name;
				groupname = data.Group_name;
				activeStats = data.Active;
				//console.log('User Name: ', username);
				//console.log('Group Name: ', groupname);
				//console.log('Active: ', activeStats);
			}
			if (responseGetGrpName.status == 403) {
				goto('/');
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
			//errorMessage = 'An error occurred while fetching user profile.';
			goto('/');
		}
		if (activeStats === 0) {
			console.log('Inactive Account');
			goto('/');
		}
		if (groupname != 'Admin') {
			console.log('User is not an Admin');
			goto('/');
		} else {
			fetchUserList();
		}
	}
	// Fetch user data on component mount
	async function fetchUserList() {
		try {
			let response = await axios.get('http://localhost:3000/user/getall', {
				withCredentials: true
			});
			if (response.status === 200) {
				userList = [];
				userList = response.data;
				userList = response.data.map((user: user, index: number) => ({
					...user,
					id: index + 1 // Simple incremental ID
				}));
				//console.log('UserList: ', userList);
			}
			if (response.status == 403) {
				goto('/');
			}
			const responseGetGroups = await axios.get('http://localhost:3000/user/getGroupNames', {
				withCredentials: true
			});
			if (responseGetGroups.status === 200) {
				let groupList = responseGetGroups.data;
				//the Group_name values are extracted from the groupList and stores them in a new array called groups
				groups = [...groupList.map((group: string) => group.Group_name)];
				//console.log('GroupList: ', groups);
			} else {
				//errorMessage = 'Unable to fetch data.';
				console.warn('Unexpected response status:', response.status);
				goto('/');
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
			console.log(error);
			// if(error.res.data.messsage = "Access denied."){
			// 	goto("/")
			// }
			errorMessage = 'An error occurred while fetching user profiles.';
			goto('/'); // Navigate to the error page
		}
	}

	// Call the function on component mount
	onMount(() => {
		getUser();
	});

	// this is new User object used in Add New User
	let newUser = {
		username: '',
		password: '',
		email: '',
		active: '1', // Default to 'Yes'
		group: [] // Default to 'Admin'
	};

	// This is to clear Add New User fields
	async function clearAddUserFields() {
		newUser.username = '';
		newUser.password = '';
		newUser.email = '';
		newUser.active = '';
		newUser.group = [];
	}

	// Edit user
	const editUser = (id: number) => {
		editGroup = userList[id].Group;
		editEmail = userList[id].Email;
		editActive = userList[id].Active;
		console.log('editUser');
		console.log(id);
		editingUserId = id; // enable the fields to be writable
	};

	// Cancel edit
	const cancelEdit = (id: number) => {
		editingUserId = null;
		passChange = false;
		emailChange = false;
		activeChange = false;
		groupChange = false;
		userList[id].password = '***';
		userList[id].Email = editEmail;
		userList[id].Active = editActive;
		userList[id].Group = editGroup;
		editEmail = '';
		editActive = '';
		editGroup = [];
	};

	function validateName(name: string) {
		const line = new RegExp(/^[a-zA-Z0-9]+$/); // No spaces allowed
		return line.test(name);
	}

	// Add new user
	const addUser = async () => {
		// Validate user name and password fields
		if (validateEmpty(newUser.username)) {
			errorMessage = 'Please enter the name';
			addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 1000
			});
			return;
		}
		if (!validateName(newUser.username)) {
			errorMessage = 'Only numeric and alphabets allowed';
			addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 1000
			});
			return;
		}
		if (!validatePassword(newUser.password)) {
			errorMessage =
				'Password must be 8-10 characters long and include letters, numbers, and special characters.';
			addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 1000
			});
			return;
		}
		if (userList.some((user) => user.User_name.toLowerCase() === newUser.username.toLowerCase())) {
			errorMessage = 'User Name already exist.';
			addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 1000
			});
			return;
		}
		// if(newUser.email !="")
		// {
		if(!validateEmail(newUser.email)) {
		 	errorMessage = 'Invalid email format (e.g. example@domain.com)';
			addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 1000
			});
			return;
		// 	}
		// }
		// if(newUser.group.length===0)
		// {
		// 	newUser.group=[];
		// }
		} else {
			// once both username and password are validated, procceed to add.
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
						},
						withCredentials: true
					}
				);
				// Clear the form and reload the user list
				successMessage = response.data.message || 'New User added successfully!';
				addToast({
					message: successMessage,
					type: 'success',
					dismissible: true,
					timeout: 1000
				});
				await clearAddUserFields();
				editingUserId = null;
				await fetchUserList();
				goto('/user-management');
			} catch (error) {
				console.error('Error adding user:', error);
				//goto('/');
				// if (error.response.data.message == 'Access denied.') {
				// 	goto('/');
				// }
				// if (error.response.data.message == 'Access denied.') {
				goto('/');
				//}
			}
		}
	};

	let showPopup = false;

	const handleAddGroup = (groupName: string) => {
		console.log('Now handleAddGroup Parent');
		console.log('Group added:', groupName);
		if (!groups.includes(groupName)) {
			groups = [...groups, groupName]; // Add the new group to the list
		}
		showPopup = false; // Close the pop-up after adding the group
	};

	const handleOpenPopup = () => {
		showPopup = true;
	};

	const handleClosePopup = () => {
		console.log('Now handle close up');
		showPopup = false;
	};

	async function saveChanges(index) {
		//console.log('We are in the save changes function:');
		//console.log('Username: ', userList[index].User_name);
		//console.log(userList[index]);
		if (passChange) {
			//console.log('Change Password: ', userList[index].password);
			if (!validatePassword(userList[index].password)) {
				errorMessage =
					'Password must be 8-10 characters long and include letters, numbers, and special characters.';
				addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 3000
				});
				return;
			}
			try {
				// update-password"
				const response = await axios.put(
					'http://localhost:3000/user/update-password-admin',
					{
						User_name: userList[index].User_name,
						Password: userList[index].password
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						withCredentials: true // Include cookies with the request
					}
				);
				if (response.status == 200) {
					successMessage = 'Update Password succesfully';
					addToast({
						message: successMessage,
						type: 'success',
						dismissible: true,
						timeout: 5000 // 5 seconds
					});
					editingUserId = null;
				}
			} catch (error) {
				//console.log(error);
				if (error.response.status == 403) {
					console.log('Unauthorized access!');
					goto('/');
					return;
				}
				console.log('Server Error caught here');
				goto('/');
			}
		}
		if (emailChange) {
			//console.log('Email change:');
			//console.log('New email: ', userList[index].Email);
			if (!validateEmail(userList[index].Email)) {
				errorMessage = 'Invalid email format (e.g. example@domain.com)';
				addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 3000
				});
				return;
			}
			try {
				const response = await axios.put(
					'http://localhost:3000/user/update-email-admin',
					{
						User_name: userList[index].User_name,
						Email: userList[index].Email
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						withCredentials: true // Include cookies with the request
					}
				);
				if (response.status == 200) {
					successMessage = 'Email updated succesfully';
					addToast({
						message: successMessage,
						type: 'success',
						dismissible: true,
						timeout: 1000 // 5 seconds
					});
					editingUserId = null;
				}
			} catch (error) {
				//console.log('Unble to update email');
				if (error.response.status == 403) {
					console.log('Unauthorized access!');
					goto('/');
					return;
				}
				console.log('Server Error caught here');
				goto('/');
			}
		}
		if (activeChange) {
			//console.log('Active change:');
			//console.log('Active: ', userList[index].Active);
			try {
				const response = await axios.put(
					'http://localhost:3000/user/update-active',
					{
						User_name: userList[index].User_name,
						Active: userList[index].Active
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						withCredentials: true // Include cookies with the request
					}
				);
				if (response.status == 200) {
					successMessage = 'Active updated succesfully';
					console.log('Active has been updated:');
					addToast({
						message: successMessage,
						type: 'success',
						dismissible: true,
						timeout: 2000 // 5 seconds
					});
					editActive = null;
					editingUserId = null;
				}
			} catch (error) {
				//console.log('Unable to update Active Status');
				if (error.response.status == 403) {
					console.log('Unauthorized access!');
					goto('/');
					return;
				}
				console.log('Server Error caught here');
				goto('/');
			}
		}
		if (groupChange) {
			//console.log('Group change:');
			//console.log('Group: ', userList[index].Group);
			try {
				const response = await axios.put(
					'http://localhost:3000/user/update-groups',
					{
						User_name: userList[index].User_name,
						Group_name: userList[index].Group
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						withCredentials: true // Include cookies with the request
					}
				);
				if (response.status == 200) {
					successMessage = 'Group updated succesfully';
					addToast({
						message: successMessage,
						type: 'success',
						dismissible: true,
						timeout: 1000 // 5 seconds
					});
					editGroup = [];
					editingUserId = null;
				}
			} catch (error) {
				//console.log(error);
				if (error.response.status == 403) {
					console.log('Unauthorized access!');
					goto('/');
					return;
				}
				console.log('Server Error caught here');
				goto('/');
			}
		}
		index = null;
		editingUserId = null;
		// reset flags
		passChange = false;
		emailChange = false;
		activeChange = false;
		groupChange = false;
		await fetchUserList();
		//goto('/user-management');
	}
</script>

<TopNavBar {pageName} {username} />
<div class="createGrp-container">
	<button class="add-group-btn" on:click={handleOpenPopup}>Create New Group</button>
</div>

<table class="table1">
	<h2>Add New User</h2>
		<tr>
			<td><input type="text" placeholder="Username" bind:value={newUser.username} required /></td>
			<td
				><input type="password" placeholder="Password" bind:value={newUser.password} required /></td
			>
			<td><input type="text" placeholder="Email" bind:value={newUser.email} /></td>
			<td>
				<select bind:value={newUser.active}>
					<option value="1">Yes</option>
					<option value="2">No</option>
				</select>
			</td>
			<td>
				<MultiSelect bind:selected={newUser.group} options={groups} />
				<!--{#each groups as group (group)}
					<label><input type="checkbox" value={group} bind:group={newUser.group} />{group}</label>
				{/each}-->
			</td>
			<td><button on:click={addUser}>Add User</button></td>
		</tr>
</table>
<table class="table2">
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
		{#each userList as user, index}
			<tr>
				<td>{user.User_name}</td>
				<td class="password-col">
					{#if editingUserId == index}
						<input
							type="password"
							id="password"
							name="password"
							bind:value={userList[index].password}
							on:change={(e) => (passChange = true)}
						/>
					{:else}
						{'*********'}
					{/if}
				</td>
				<td>
					{#if editingUserId == index}
						<input
							type="text"
							id="email"
							name="email"
							bind:value={userList[index].Email}
							on:change={(e) => (emailChange = true)}
						/>
					{:else}
						{user.Email}
					{/if}
				</td>
				<td>
					{#if editingUserId == index}
						<select bind:value={userList[index].Active} on:change={(e) => (activeChange = true)}>
							<option value="1">Yes</option>
							<option value="0">No</option>
						</select>
					{:else if user.Active == 1}
						Yes
					{:else if user.Active == 0}
						No
					{/if}
				</td>
				<td>
					{#if editingUserId == index}
						<MultiSelect
							bind:selected={userList[index].Group}
							options={groups}
							on:change={(e) => (groupChange = true)}
						/>
						<!--<select bind:value={user.Group}>-->
						<!--{#each groups as group (group)}
							<label><input type="checkbox" value={group} bind:group={editGroup} checked={user.Group.includes(group)} on:change={(e) => (groupChange = true)}>{group}</label>
						{/each}-->
					{:else}
						{user.Group}
					{/if}
				</td>
				<td>
					{#if editingUserId === index}
						<div class="action-buttons">
							<a class="cancel-btn" on:click={() => cancelEdit(index)}>Cancel</a>
							<a class="save-btn" on:click={() => saveChanges(index)}>Save</a>
						</div>
					{:else}
						<a class="edit-btn" on:click={() => editUser(index)}>Edit</a>
					{/if}
				</td>
			</tr>
		{/each}
		
	</tbody>
</table>
<Toast />

<Popup {groups} visible={showPopup} onClose={handleClosePopup} onAddGroup={handleAddGroup} />

<style>
	.table1, .table2 {
		width: 100%;
		border-collapse: collapse;
		
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
		width: 500px;
	}

	.overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		cursor: pointer;
	}

	.popup-buttons {
		display: flex;
		justify-content: space-between;
		margin-top: 20px;
	}

	.createGrp-container {
		display: flex;
		justify-content: flex-end; /* Align items to the right */
		padding: 5px;
	}

	.edit-btn:hover,
	.cancel-btn:hover,
	.save-btn:hover {
		text-decoration: underline;
		cursor: pointer;
	}
</style>
