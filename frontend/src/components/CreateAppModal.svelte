<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import axios from 'axios';
	import MultiSelect from 'svelte-multiselect';
    import {validateEmpty, validateGroupName, validateName} from "../utils/validators";
	import { goto } from '$app/navigation';
	import { toasts } from './store';
    import { addToast } from './store';

	let errorMessage='';
	let errorMsg=false;
	const regex = /^[0-9]+$/;
	let successMessage='';

	let acronym = '';
	let description = '';
	let rNumber = '';
	let startDate = '';
	let endDate = '';
	let permitGroup = {
		create: [],
		open: [],
		todo: [],
		doing: [],
		done: []
	};
	let availGrps = [];
	let grpNames = [];

	// Reference for inputs 
	let acronymInput;
	let rNumberInput;
	let startDateInput;
	let endDateInput;
	let descriptionInput;

	export let appListNames =null;

	const dispatch = createEventDispatcher();

	//const availableGroups = ['Project Lead', 'Project Manager', 'Developer']; // Example group list

	function closeModal() {
		dispatch('close');
	}

	async function fetchGroups() {
		try {
			const response = await axios.get('http://localhost:3000/user/getGroupNames', {
				withCredentials: true
			});
			if (response.status == 200) {
				availGrps = await response.data;
                grpNames = availGrps.map(grp => grp.Group_name);
				// availGrps.forEach((grp) => {
				// 	grpNames.push(grp.Group_name);
				// });
				console.log('List of Group fetched: ', grpNames);
			}
		} catch (error) {
			console.log('Error fetching group: ', error);
		}
	}

	async function createApp() {
		console.log('Create App');
		const newApp = {
			acronym,
			description,
			rNumber,
			startDate,
			endDate,
			permitGroup
		};
		console.log(newApp);

		try {
			const response = await axios.post(
				'http://localhost:3000/tasks/create-app',
				{
					App_Acronym: acronym,
					App_Description: description,
					App_Rnumber: rNumber,
					App_startDate: startDate,
					App_endDate: endDate,
					App_permit_Create: permitGroup.create,
					App_permit_Open: permitGroup.open,
					App_permit_toDoList: permitGroup.todo,
					App_permit_Doing: permitGroup.doing,
					App_permit_Done: permitGroup.done
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true //
				}
			);

			if(response.status == 200 ){
				successMessage = 'App created successfully'
				addToast({
				message: successMessage,
				type: 'success',
				dismissible: true,
				timeout: 1000
			});
		}
			dispatch('appCreated', newApp); // Notify parent that the app was created
		} catch (error) {
			console.error('Error creating the application:', error);
			if (error.response.data.message == 'Access denied.') {
				goto('/');
			}
			// if(error.response.status==403){
			// 	errorMessage = 'Unauthorized to create app'
			// 	addToast({
			// 	message: errorMessage,
			// 	type: 'error',
			// 	dismissible: true,
			// 	timeout: 1000
			// });
			// dispatch('close');
			// }
			if(error.response.status==500){
				errorMessage = 'Failed to create app'
				addToast({
				message: errorMessage,
				type: 'error',
				dismissible: true,
				timeout: 1000
			});
			dispatch('close');
			}
		}
	}

	function validateFields(){
		console.log("Length of characters in description: ",description.length);
		// check for empty fields
		if(!acronym)
	    {
			errorMsg = true;
			acronymInput.focus();
		    return errorMessage='App Acronym is empty';
	    }
		if(!validateGroupName(acronym))
		{
			errorMsg = true;
			acronymInput.focus();
			return errorMessage='Only Alphabets and numeric allowed';
		}
		if(appListNames.includes(acronym))
		{
			errorMsg = true;
			acronymInput.focus();
			return errorMessage="Duplicate Acronym Name";
		}
		if(!regex.test(rNumber))
		{
			errorMsg = true;
			rNumberInput.focus();
			return errorMessage="Only postive numbers allowed.";
		}
		if(rNumber<0)
		{
			errorMsg = true;
			rNumberInput.focus();
			return errorMessage="Only positive numbers allowed.";
		}
		if(description.length>255){
			errorMsg=true;
			descriptionInput.focus();
			//console.log("Characters used for input: ",description);
			return errorMessage='Max characters is 255.'
		}
		if(!startDate)
        {
		    errorMsg = true;
			startDateInput.focus();
		    return errorMessage='Start date cannot be empty';
	    }
		if(!endDate)
        {
		    errorMsg = true;
			endDateInput.focus();
		    return errorMessage='End date cannot be empty';
	    }
		if(!validateDates(startDate,endDate))
		{
			errorMsg = true;
			endDateInput.focus();
		    return errorMessage='End date cannot be before start date';
		}
		console.log("Validation done.");
		console.log("Proceed to create app.");
		createApp();
	}


	function validateDates(startDate,endDate){
		const start = new Date(startDate);
		const end = new Date(endDate);

		if(end < start){
			return false;
		} else {
			return true;
		}
	}

	onMount(() => {
		fetchGroups();
	});
</script>

<div class="modal">
	<div class="modal-content">
		<h2>Create App</h2>
		<div class="upper-form-container">
			<!-- Acronym Input -->
			<div class="form-group">
				<label>Acronym:</label>
				<input type="text" bind:this={acronymInput} bind:value={acronym} required/>
			</div>

			<!-- Description Input -->
			<div class="form-group">
				<label>Description:</label>
				<textarea bind:value={description} class="description-input" bind:this={descriptionInput} rows="3" maxlength="255"></textarea>
				<!--<input type="text" bind:value={description} class="description-input"/>-->
			</div>

			<!-- R Number Input -->
			<div class="form-group">
				<label>R number:</label>
				<input type="text" bind:this={rNumberInput} bind:value={rNumber} required/>
			</div>
			</div>
			<p></p>
			<div class="form-container">
			<!-- Start and End Date Inputs -->
			<div class="form-group">
				<label>Start date:</label>
				<input type="date" bind:this={startDateInput} bind:value={startDate} required/>
			</div>

			<div class="form-group">
				<label>End date:</label>
				<input type="date" bind:this={endDateInput} bind:value={endDate} required/>
			</div>

			<!-- Permit Group Section -->
			<h3>Permit Group:</h3>

			<!-- Create Permission -->
			<div class="form-group">
				<label>create:</label>
				<select bind:value={permitGroup.create}>
					<option value="" disabled selected>Select group</option>
					<!-- Placeholder option -->
					{#each grpNames as group}
						<option value={group}>{group}</option> <!-- Dropdown options -->
					{/each}
				</select>
			</div>

			<!-- Open Permission -->
			<div class="form-group">
				<label>open:</label>
				<select bind:value={permitGroup.open}>
					<option value="" disabled selected>Select group</option>
					<!-- Placeholder option -->
					{#each grpNames as group}
						<option value={group}>{group}</option> <!-- Dropdown options -->
					{/each}
				</select>
			</div>

			<!-- Todo List Permission (single select dropdown) -->
			<div class="form-group">
				<label>todo list:</label>
				<select bind:value={permitGroup.todo}>
					<option value="" disabled selected>Select group</option>
					{#each grpNames as group}
						<option value={group}>{group}</option>
					{/each}
				</select>
			</div>

			<!-- Doing Permission (same dropdown format) -->
			<div class="form-group">
				<label>doing:</label>
				<select bind:value={permitGroup.doing}>
					<option value="" disabled selected>Select group</option>
					{#each grpNames as group}
						<option value={group}>{group}</option>
					{/each}
				</select>
			</div>

			<!-- Done Permission (same dropdown format) -->
			<div class="form-group">
				<label>done:</label>
				<select bind:value={permitGroup.done}>
					<option value="" disabled selected>Select group</option>
					{#each grpNames as group}
						<option value={group}>{group}</option>
					{/each}
				</select>
			</div>
		</div>

		{#if errorMsg}
            <div class="error-message" style="color: red; margin-top: 5px;">{errorMessage}</div>
        {/if}
		<!-- Buttons -->
		<div class="button-group">
			<button class="btn-primary" on:click={closeModal}>Close</button>
			<button class="btn-primary" on:click={validateFields}>Create App</button>
		</div>
	</div>
</div>

<style>
	/* Modal styling */
	.modal {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background-color: rgba(0, 0, 0, 0.5);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-content {
		background-color: white;
		padding: 20px;
		border-radius: 8px;
		width: 600px;
	}

	.upper-form-container {
		display: grid;
		grid-template-columns: 120px 1fr;
		gap: 10px 20px;
	}

	.form-container {
		display: grid;
		grid-template-columns: 120px 1fr 90px 1fr;
		gap: 10px 20px;
	}

	.form-group {
		display: contents;
	}

	label {
		align-self: center;
		justify-self: end;
	}

	input[type='text'],
	input[type='date'],
	select {
		width: 100%;
	}

	.description-input {
		width: 100%;      
		height: auto;
	}

	select[multiple] {
		height: auto;
		max-height: 150px;
	}

	h3 {
		grid-column: 1 / -1;
		margin-bottom: 10px;
	}

	.button-group {
		margin-top: 20px;
		display: flex;
		justify-content: space-between;
	}

	.btn-primary {
		background-color: #007bff; /* Blue color */
		color: white; /* White text */
		border: none;
		border-radius: 10px; /* Rounded corners */
		padding: 10px; /* Padding for a better look */
		cursor: pointer;
		font-size: 16px;
		text-align: center;
		transition: background-color 0.3s ease;
	}
</style>
