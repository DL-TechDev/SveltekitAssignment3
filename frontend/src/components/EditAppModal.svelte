<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import axios from 'axios';
	import MultiSelect from 'svelte-multiselect';
    import {validateEmpty, validateGroupName, validateName} from "../utils/validators";
	import { addToast } from './store';
	import { goto } from '$app/navigation';

	export let selectedApp; //Receive the selected app as a prop
	let successMessage='';
	let errorMessage='';
	let descriptionInput;
	let errorMsg=false;

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
	let createGrp='';
	let openGrp='';
	let todoGrp='';
	let doingGrp='';
	let doneGrp='';

	let availGrps = [];
	let grpNames = [];
	let fetchCurrentApp; // fetch app to contain the info

	//$: fetchCurrentApp;

    function validationFields() {
        if(validateGroupName(acronym))
            return console.log("Only Alphabet and Numeric are allowed.")
        
    }
	const dispatch = createEventDispatcher();

	function closeEditModal() {
		resetEditAppVariables();
		dispatch('close');
	}

	function resetEditAppVariables(){
		acronym = '';
		description = '';
		rNumber = '';
		startDate = '';
		endDate ='';
		createGrp='';
		openGrp='';
		todoGrp='';
		doingGrp='';
		doneGrp='';
	}

	async function fetchApp() {
		console.log("App_Acronym to be sending: ",selectedApp);
		// fetch app
		try {
			const response = await axios.post('http://localhost:3000/tasks/get-app',
			{
				App_Acronym: selectedApp.App_Acronym
			},
			{
				withCredentials: true
			});
			if (response.status == 200) {
				fetchCurrentApp = response.data[0];
				console.log('App fetched: ',fetchCurrentApp);
				console.log("App_Acronym: ",fetchCurrentApp.App_Acronym);
				acronym = fetchCurrentApp.App_Acronym;
				description = fetchCurrentApp.App_Description;
				rNumber = fetchCurrentApp.App_Rnumber;
				startDate = fetchCurrentApp.App_startDate;
				endDate =fetchCurrentApp.App_endDate;
				createGrp=fetchCurrentApp.App_permit_Create;
				openGrp=fetchCurrentApp.App_permit_Open;
				todoGrp=fetchCurrentApp.App_permit_toDoList;
				doingGrp=fetchCurrentApp.App_permit_Doing;
				doneGrp=fetchCurrentApp.App_permit_Done;
			}
		} catch (error) {
			console.log('Error fetching group: ', error);
		}

		// fetch groups
		try {
			const response = await axios.get('http://localhost:3000/user/app-getGroupNames', {
				withCredentials: true
			});
			if (response.status == 200) {
				availGrps = await response.data;
                grpNames = availGrps.map(grp => grp.Group_name);
				// to allow user to have an empty field for group selection
				let emptyGrp='';
				grpNames.push(emptyGrp);
				console.log('List of Group fetched: ', grpNames);
			}
		} catch (error) {
			console.log('Error fetching group: ', error);
		}
	}

	async function editApp() {
		console.log('Edit App');
		const editApp = {
			acronym,
			description,
			rNumber,
			startDate,
			endDate,
			permitGroup
		};
		console.log(editApp);
		try {
			const response = await axios.put(
				'http://localhost:3000/tasks/update-app',
				{
					App_Acronym: acronym,
					App_Description: description,
					App_permit_Create: createGrp,
					App_permit_Open: openGrp,
					App_permit_toDoList: todoGrp,
					App_permit_Doing: doingGrp,
					App_permit_Done: doneGrp
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true //
				}
			);
			if(response.status==200){
				console.log("App Updated!")
				successMessage = 'App Updated successfully'
				addToast({
				message: successMessage,
				type: 'success',
				dismissible: true,
				timeout: 1000
			});
			dispatch('appEdited', editApp); // Notify parent that the app was created
			}
		} catch (error) {
			console.error('Error creating the application:', error);
			if (error.response.data.message == 'Access denied.') {
				goto('/');
			}
			if(error.response.status==500){
					errorMessage = 'Server is unable to update the app'
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

	function validateInput(){
		console.log("Length of characters in description: ",description.length);
		if(description.length>255){
			errorMsg=true;
			descriptionInput.focus();
			return errorMessage='Max characters is 255.'
		}
		editApp();
	}

	onMount(() => {
		fetchApp();
	});
</script>

<div class="modal">
	<div class="modal-content">
		<h2>Edit App</h2>
		<div class="upper-form-container">
			<!-- Acronym Input -->
			<div class="form-group">
				<label>Acronym:</label>
				<input type="text" bind:value={acronym} disabled/>
				<!--<input type="text" bind:value={acronym} />-->
			</div>

			<!-- Description Input -->
			<div class="form-group">
				<label>Description:</label>
				<textarea class="description-input"  bind:value={description} bind:this={descriptionInput} rows="5" maxlength=255/>
			</div>

			<!-- R Number Input -->
			<div class="form-group">
				<label>R number:</label>
				<input type="text" bind:value={rNumber} disabled/>
			</div>

			</div>
			<p></p>
			<div class="form-container">

			<!-- Start and End Date Inputs -->
			<div class="form-group">
				<label>Start date:</label>
				<input type="text" bind:value={startDate} disabled />
			</div>

			<div class="form-group">
				<label>End date:</label>
				<input type="text" bind:value={endDate} disabled/>
			</div>

			<!-- Permit Group Section -->
			<h3>Permit Group:</h3>

			<!-- Create Permission -->
			<div class="form-group">
				<label>create:</label>
				<!---<input type="text" bind:value={createGrp}/>-->
				<select bind:value={createGrp}>
					<option value="" disabled selected>Select group</option>
					<!-- Placeholder option -->
					{#each grpNames as group}
						<option value={group}>{group}</option> <!-- Dropdown options -->
					{/each}
			</div>

			<!-- Create Permission -->
			<div class="form-group">
				<label>open:</label>
				<select bind:value={openGrp}>
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
				<select bind:value={todoGrp}>
					<option value="" disabled selected>Select group</option>
					{#each grpNames as group}
						<option value={group}>{group}</option>
					{/each}
				</select>
			</div>

			<!-- Doing Permission (same dropdown format) -->
			<div class="form-group">
				<label>doing:</label>
				<select bind:value={doingGrp}>
					<option value="" disabled selected>Select group</option>
					{#each grpNames as group}
						<option value={group}>{group}</option>
					{/each}
				</select>
			</div>

			<!-- Done Permission (same dropdown format) -->
			<div class="form-group">
				<label>done:</label>
				<select bind:value={doneGrp}>
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
			<button class="btn-primary" on:click={closeEditModal}>Close</button>
			<button class="btn-primary" on:click={validateInput}>Save</button>
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
		grid-template-columns: 150px 1fr;
		gap: 10px 20px;
	}

	.form-container {
		display: grid;
		grid-template-columns: 150px 1fr 90px 1fr;;
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