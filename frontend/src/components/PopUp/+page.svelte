<script>
	//import { createEventDispatcher } from 'svelte';
	import Toast from '../../components/Toast.svelte';
	import { addToast } from '../../components/store';
	import axios from 'axios';
	export let visible = false;
	export let onClose = () => {};
	export let onAddGroup = (groupName) => {};
	export let groups = [];
	import { goto } from '$app/navigation';
	let errorMsg = false;
	let errorMessage = '';
	let successMessage = '';

	//const dispatch = createEventDispatcher();
	let groupName = '';

	function validateGroupName(groupName) {
		const line = new RegExp(/^[a-zA-Z0-9_]+$/);
		if (!line.test(groupName)) {
			errorMsg = true;
			errorMessage = 'Required correct format';
			return false;
		}
		if (groups.includes(groupName)) {
			errorMsg = true;
			errorMessage = 'Group Already exist';
			return false;
		} else {
			addGroup();
		}
	}

	const handleAddGroup = () => {
		console.log("Handle the pop up handlAddGroup btn");
		if(validateGroupName(groupName))
			onClose();
		return;
	};

	const handleClose = () => {
		console.log("Now it handles the pop up handleClose");
		errorMessage='';
		groupName='';
		onClose();
	};

	const addGroup = async () => {
		try {
			const response = await axios.post(
				'http://localhost:3000/user/addGroup',
				{
					Group_name: groupName
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true //
				}
			);
			if (response.status == 200) {
				successMessage = 'New Group added successfully';
				addToast({
					message: successMessage,
					type: 'success',
					dismissible: true,
					timeout: 3000
				});
				onAddGroup(groupName);
				groupName = ''; // Clear the input field
				onClose();
			}
			// Clear the form and reload the user list
		} catch (error) {
			console.error('Error adding group:', error);
			if (error.response.data.message == 'Access denied.') {
				goto('/');
			}
		}
	};
</script>

{#if visible}
	<div class="popup-overlay">
		<div class="popup-content">
			<h3 id="popup-title">Add New Group Type</h3>
			<div class="inputGrpDiv">
				<input
					class="inputGrpTxt"
					type="text"
					bind:value={groupName}
					placeholder="Enter group name"
				/>
			</div>
			<div class="button-group">
				<button class="closeBtn" on:click={handleClose}>Close</button>
				<button class="addBtn" on:click={handleAddGroup}>Add Group</button>
			</div>
			{#if errorMsg}
				<div class="error-message" style="color: red; margin-top: 5px;">
					<p>{errorMessage}</p>
				</div>
			{/if}
		</div>
	</div>
{/if}

<Toast />

<style>
	.popup-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.5);
		z-index: 999;
		cursor: pointer;
	}

	.popup-content {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background: white;
		border: 1px solid #ccc;
		padding: 20px;
		box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
		z-index: 1000;
		width: 500px;
	}

	.button-group {
		display: flex;
		justify-content: flex-end;
		margin-top: 10px;
	}

	button {
		padding: 10px 20px;
		border: none;
		border-radius: 5px;
		cursor: pointer;
		background-color: #007bff;
    	color: white;
		margin-left: 10px;
	}

	.inputGrpTxt {
		font-size: 24px;
		padding: 10px;
		width: 75%;
		padding-left: 100px;
	}

	.error {
		color: red;
	}
</style>
