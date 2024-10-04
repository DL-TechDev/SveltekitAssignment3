<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import axios from 'axios';
	import MultiSelect from 'svelte-multiselect';
	import { validateEmpty, validateGroupName, validateName } from '../utils/validators';
	import { goto } from '$app/navigation';
	import { appAcronymStore } from '$lib/stores';
	import { writable } from 'svelte/store';
	import { toasts } from './store';
	import { addToast } from './store';

	let currentDate = '';
	let currentTime = '';

	export const rNumberStore = writable(null);
	// Automatically update when rNumber changes
	let rNumber = $rNumberStore;

	let successMessage = '';
	let errorMessage = '';
	let errorMsg = false;
	const regex = /^[0-9]+$/;
	let activeStatus;

	const dispatch = createEventDispatcher();

	export let appAcronym = null;
	export let username = null; //import username
	export let planNames = null; //import list of plan names
	export let editTask;
	let fetchCurrentTask; // fetch task to hold info

	let currentTaskId;
	let editTaskName = '';
	let editTaskAppAcronym = '';
	let editTaskDescription = '';
	let editTaskPlan = '';
	let editTaskNotes = '';
	let editTaskState = '';
	let editTaskOwner = '';
	let taskCreator = '';
	let taskCreatedDate = '';
	let oldState='';

	// permissions
	let appPermitOpen = false;
	let appPermitToDo = false;
	let appPermitDoing = false;
	let appPermitDone = false;
	// group
	let grpPermitOpen = '';
	let grpPermitToDo = '';
	let grpPermitDoing = '';
	let grpPermitDone = '';

	let groupname = [];

	let purpose='task';

	let saveBtnLabel='Save Changes';
	let demoteBtnLabel='Demote';
	let promoteBtnLabel='Promote';
	// let plansList=[];
	// async function getPlans() {
	// 	try {
	// 		// get the group this user is in
	// 		const response = await axios.post('http://localhost:3000/tasks/get-related-plans',
	// 		{
	// 			Plan_app_Acronym: appAcronym
	// 		},
	// 		{
	// 			withCredentials: true
	// 		});

	// 		if (response.status === 200) {
	// 			const data = await response.data;
	// 			console.log("Data :",data);
	// 			console.log("Data length: ",data.length)
	// 			//add empty plan
	// 			if(data.length==0)
	// 			{
	// 				console.log("No plan was retreived for this app.");
	// 				plansList=[];
	// 			}
	// 			else if(data.length==1)
	// 			{
	// 				plansList=data;
	// 				let tempName=data[0].Plan_MVP_name;
	// 				planNames.push(tempName);
	// 				console.log("Single Plan: ",planNames);
	// 			} else 
	// 			{
	// 				plansList=data;
	// 				planNames = [...data.map((plan)=>plan.Plan_MVP_name)];
	// 			}			 
	// 		}
	// 		if (response.status == 403) {
	// 			goto('/');
	// 		}
	// 	} catch (error) {
	// 		console.error('Error fetching plans', error);
	// 		//errorMessage = 'An error occurred while fetching plans.';
	// 		goto('/');
	// 	}
	// }

	export function resetPermitAndGroups() {
		// permissions
		let appPermitOpen = false;
		let appPermitToDo = false;
		let appPermitDoing = false;
		let appPermitDone = false;
		// group
		let grpPermitOpen = '';
		let grpPermitToDo = '';
		let grpPermitDoing = '';
		let grpPermitDone = '';
	}

	export async function getAppPermit(groupname) {
		let appName = editTaskAppAcronym;
		console.log("Getting App's Permissions: ", appName);
		try {
			const response = await axios.post(
				'http://localhost:3000/tasks/get-app',
				{
					App_Acronym: appName
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);
			if (response.status === 200) {
				let data = response.data[0];
				console.log('App Data revceived: ', data);
				grpPermitOpen = data.App_permit_Open;
				grpPermitToDo = data.App_permit_toDoList;
				//console.log("Todo permission: ",grpPermitToDo);
				grpPermitDoing = data.App_permit_Doing;
				grpPermitDone = data.App_permit_Done;
				console.log("User's group Names: ", groupname);

				//set permission:
				if (groupname.includes(grpPermitOpen)) {
					console.log('User has open permission');
					appPermitOpen = true;
				}
				if (groupname.includes(grpPermitToDo)) {
					console.log('User has todo permission');
					appPermitToDo = true;
				}
				if (groupname.includes(grpPermitDoing)) {
					console.log('User has doing permission');
					appPermitDoing = true;
				}
				if (groupname.includes(grpPermitDone)) {
					console.log('User has done permission');
					appPermitDone = true;
				}
				setupForm();
			}
		} catch (error) {
			console.error('Eror fetching app permit:', error);
			goto('/');
		}
	}

	export async function GetProfile() {
		try {
			const response = await axios.get('http://localhost:3000/user/profile', {
				withCredentials: true
			});
			//console.log('User profile:', response.data);

			if (response.status === 200) {
				//console.log("We are in the response status 200");
				const data = response.data[0];
				// Assign name
				username = data.User_name;
				activeStatus = data.Active;
				console.log('Username: ', username);
				checkgroup(username, groupname);
			} else {
				// unable to fetch data
				goto('/error');
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
			//errorMessage = 'An error occurred while fetching user profile.';
			goto('/error'); // Use goto for navigation
		}
		if (activeStatus == 0) {
			console.log('Inactive Account');
			goto('/');
		}
	}

	export async function checkgroup(username, groupname) {
		try {
			const response = await axios.post(
				'http://localhost:3000/user/user-group-name',
				{
					User_name: username
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);
			if (response.status === 200) {
				//console.log("We are in the response status 200");
				const data = response.data;
				console.log('Groups: ', data);
				groupname = data.map((grp) => grp.Group_name);
				getAppPermit(groupname);
			} else {
				// unable to fetch data
				goto('/error');
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
			//errorMessage = 'An error occurred while fetching user profile.';
			goto('/'); // Use goto for navigation
		}
	}

	let statePlan=false;
	let stateNotes=false;
	let stateSaveChanges=false;
	let stateDemote=false;
	let statePromote=false;

	export function resetInputStates(){
		statePlan=false;
		stateNotes=false;
		stateSaveChanges=false;
		stateDemote=false;
		statePromote=false;
	}

	export function setupForm(){
		console.log("Setting up the form with the permit")
		if(editTaskState=='open' && appPermitOpen==true)
		{
			console.log("This form is an open state and user has the right");
			statePlan=true;
			stateNotes=true;
			stateSaveChanges=true;
			stateDemote=false;
			statePromote=true;

			//set button labels:
			//saveBtnLabel='Save Changes';
			//demoteBtnLabel='Demote';
			promoteBtnLabel='Release';
		}
		else if(editTaskState=='todo' && appPermitToDo)
		{
			console.log("This form is an todo state and user has the right");
			statePlan=false;
			stateNotes=true;
			stateSaveChanges=true;
			stateDemote=false;
			statePromote=true;

			//set button labels:
			//saveBtnLabel='Save Changes';
			//demoteBtnLabel='Demote';
			promoteBtnLabel='Take on';
		}
		else if(editTaskState=='doing' && appPermitDoing)
		{
			console.log("This form is an doing state and user has the right");
			statePlan=false;
			stateNotes=true;
			stateSaveChanges=true;
			stateDemote=true;
			statePromote=true;

			//set button labels:
			//saveBtnLabel='Save Changes';
			demoteBtnLabel='Give up';
			promoteBtnLabel='To review';
		}
		else if(editTaskState=='done' && appPermitDone)
		{
			console.log("This form is done state and user has the right");
			statePlan=true;
			stateNotes=true;
			stateSaveChanges=true;
			stateDemote=true;
			statePromote=true;
			//set button labels:
			//saveBtnLabel='Save Changes';
			demoteBtnLabel='Reject';
			promoteBtnLabel='Approve';
		} 
		else if(editTaskState=='closed')
		{
			console.log("This form is an closed state");
			statePlan=false;
			stateNotes=false;
			stateSaveChanges=false;
			stateDemote=false;
			statePromote=false;
		} else {
			console.log("This form is only for viewing");
			statePlan=false;
			stateNotes=false;
			stateSaveChanges=false;
			stateDemote=false;
			statePromote=false;
		}
	}

	let initialPlan='';
	let selectedPlan='';
	export function handlePlanChange(event){
		selectedPlan = event.target.value;
		if(selectedPlan==='')
		{
			selectedPlan = null;
		}
		console.log("initialPlan: ",initialPlan);
		console.log("selectedPlan: ",selectedPlan);
		if(oldState=='done' && (initialPlan!==selectedPlan))
		{
			console.log("Plan has changed");
			stateSaveChanges=false;
			statePromote=false;
			planChange=true;
			// selectedPlan = event.target.value;
		}
		if(oldState=='done' && (initialPlan===selectedPlan))
		{
			console.log("No change to plan");
			stateSaveChanges=true;
			statePromote=true;
			planChange=false;
		}
		planChange=true;
	}

	export function getDate() {
		const today = new Date();
		const yyyy = today.getFullYear();
		const mm = String(today.getMonth() + 1).padStart(2, '0');
		const dd = String(today.getDate()).padStart(2, '0');
		//currentDate = `${yyyy}-${mm}-${dd}`;
		let nowDate = `${dd}-${mm}-${yyyy}`;
		return nowDate;
	}

	export function getTime() {
		const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
		console.log('nowTime: ', nowTime);
		return nowTime;
	}

	let task = {
		id: '<Task_id>',
		name: '<Task_name>',
		description:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit. some random description...',
		state: 'Open',
		plan: 'Plan 1',
		creator: '<creator_username>',
		owner: '<owner_username>',
		createdDate: '01/12/2023',
		notes: 'Notes Field'
	};
	let newNotes = '';

	// set flags for changes
	let planChange = false;
	let notesChange = false;

	let showPlanList = false;

	function addEmptyPlan() {
		let noPlan = '';
		planNames.push(noPlan);
		console.log('added empty plan: ', planNames);
		showPlanList = true;
	}

	function removeEmptyPlan() {
		planNames = planNames.pop();
		console.log('Remove empty plan: ', planNames);
	}

	async function promoteTask() {
		console.log('Updating task :');
		let newState = '';
		let currentState = editTaskState;
		if (currentState == 'open') newState = 'todo';
		if (currentState == 'todo') newState = 'doing';
		if (currentState == 'doing') newState = 'done';
		if (currentState == 'done') newState = 'closed';
		console.log('New State: ', newState);

		currentDate = getDate();
		currentTime = getTime();
		let addNotes = `Name: ${username} Current state: ${newState}  Date and Time: ${currentDate}, ${currentTime}`;
		console.log('Addtional Notes: ', addNotes);


		newNotes = `\n${newNotes} \n\n${addNotes} \n\n${editTaskNotes}`;
		//newNotes = `\n${editTaskNotes} \n\n${newNotes} \n${addNotes}`;
		let newTaskNotes = newNotes;
		console.log('Notes: ', newTaskNotes);
		console.log('Create Task');

		// if there is change in plan
		if (planChange) {
			console.log('Change of Plan: ', editTaskPlan);
			try {
				const response = await axios.put(
					'http://localhost:3000/tasks/update-task-withplan',
					{
						Task_id: currentTaskId,
						Task_plan: editTaskPlan,
						Task_state: newState,
						Task_app_Acronym: editTaskAppAcronym,
						Task_notes: newTaskNotes,
						Task_owner: username,
						Purpose: purpose,
						Previous_state:oldState,
						Task_creator: taskCreator
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						withCredentials: true // Include cookies with the request
					}
				);
				if (response.status == 200) {
					successMessage = 'Task has been promoted successfully';
					addToast({
						message: successMessage,
						type: 'success',
						dismissible: true,
						timeout: 1000
					});
					removeEmptyPlan();
					//set flags back to normal
					planChange = false;
					resetPermitAndGroups();
					resetInputStates();
					dispatch('close');
				}
			} catch (error) {
				console.error('Error updating task:', error);
				if (error.response.data.message == 'Access denied.') {
					goto('/');
				}
				if(error.response.status==403){
					errorMessage = 'Unauthorized to edit task'
					addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 1000
				});
				dispatch('close');
				}
				// if(error.response.status==500){
				// 	errorMessage = 'Server unable to process task data'
				// 	addToast({
				// 	message: errorMessage,
				// 	type: 'error',
				// 	dismissible: true,
				// 	timeout: 1000
				// });
				// dispatch('close');
				// }
			}
		} else {
			console.log('Updating task with new state');
			try {
				const response = await axios.put(
					'http://localhost:3000/tasks/update-task',
					{
						Task_id: currentTaskId,
						Task_state: newState,
						Task_app_Acronym: editTaskAppAcronym,
						Task_notes: newTaskNotes,
						Task_owner: username,
						Purpose: purpose,
						Previous_state:oldState,
						Task_creator: taskCreator
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						withCredentials: true // Include cookies with the request
					}
				);
				if (response.status == 200) {
					successMessage = 'Task has been promoted successfully';
					addToast({
						message: successMessage,
						type: 'success',
						dismissible: true,
						timeout: 1000
					});
					removeEmptyPlan();
					//set flags back to normal
					planChange = false;
					resetPermitAndGroups();
					resetInputStates();
					dispatch('close');
				}
			} catch (error) {
				console.error('Error updating the task:', error);
				if (error.response.data.message == 'Access denied.') {
					goto('/');
				}
				if(error.response.status==403){
					errorMessage = 'Unauthorized to edit task'
					addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 1000
				});
				dispatch('close');
				}
				// if(error.response.status==500){
				// 	errorMessage = 'Server unable to process task data'
				// 	addToast({
				// 	message: errorMessage,
				// 	type: 'error',
				// 	dismissible: true,
				// 	timeout: 1000
				// });
				// dispatch('close');
				// }
			}
		}
	}

	async function demoteTask() {
		console.log('Demoting task :');
		let newState = '';
		let currentState = editTaskState;
		if (currentState == 'closed') newState = 'done';
		if (currentState == 'done') newState = 'doing';
		if (currentState == 'doing') newState = 'todo';
		if (currentState == 'todo') newState = 'open';
		console.log('New State: ', newState);

		currentDate = getDate();
		currentTime = getTime();
		let addNotes = `Name: ${username} Current state: ${newState}  Date and Time: ${currentDate}, ${currentTime}`;
		console.log('Addtional Notes: ', addNotes);
		newNotes = `\n${newNotes} \n\n${addNotes} \n\n${editTaskNotes}`;
		//newNotes = `\n${editTaskNotes} \n\n${newNotes} \n${addNotes}`;
		let newTaskNotes = newNotes;
		console.log('Notes: ', newTaskNotes);
		console.log('Update Task');

		// if there is change in plan
		if (planChange) {
			console.log('Change of Plan: ', editTaskPlan);
			try {
				const response = await axios.put(
					'http://localhost:3000/tasks/update-task-withplan',
					{
						Task_id: currentTaskId,
						Task_plan: editTaskPlan,
						Task_state: newState,
						Task_app_Acronym: editTaskAppAcronym,
						Task_notes: newTaskNotes,
						Task_owner: username,
						Purpose: purpose,
						Previous_state:oldState,
						Task_creator: taskCreator
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						withCredentials: true // Include cookies with the request
					}
				);
				if (response.status == 200) {
					successMessage = 'Task has been demoted successfully';
					addToast({
						message: successMessage,
						type: 'success',
						dismissible: true,
						timeout: 1000
					});
					removeEmptyPlan();
					//set flags back to normal
					planChange = false;
					resetPermitAndGroups();
					resetInputStates();
					dispatch('close');
				}
			} catch (error) {
				console.error('Error updating task:', error);
				if (error.response.data.message == 'Access denied.') {
					goto('/');
				}
				if(error.response.status==403){
					errorMessage = 'Unauthorized to edit task';
					addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 1000
				});
				dispatch('close');
				}
				if(error.response.status==500){
					errorMessage = 'Server unable to process task data';
					addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 1000
				});
				dispatch('close');
				}
			}
		} else {
			console.log('Updating task with new state');
			try {
				const response = await axios.put(
					'http://localhost:3000/tasks/update-task',
					{
						Task_id: currentTaskId,
						Task_state: newState,
						Task_app_Acronym: editTaskAppAcronym,
						Task_notes: newTaskNotes,
						Task_owner: username,
						Purpose: purpose,
						Previous_state:oldState,
						Task_creator: taskCreator
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						withCredentials: true // Include cookies with the request
					}
				);
				if (response.status == 200) {
					successMessage = 'Task has been demoted successfully';
					addToast({
						message: successMessage,
						type: 'success',
						dismissible: true,
						timeout: 1000
					});
					removeEmptyPlan();
					//set flags back to normal
					planChange = false;
					resetPermitAndGroups();
					resetInputStates();
					dispatch('close');
				}
			} catch (error) {
				console.error('Error updating the task:', error);
				if (error.response.data.message == 'Access denied.') {
					goto('/');
				}
				if(error.response.status==403){
					errorMessage = 'Unauthorized to edit task';
					addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 1000
				});
				dispatch('close');
				}
				if(error.response.status==500){
					errorMessage = 'Server unable to process task data';
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
	}

	async function saveChangesTask() {
		console.log('Save Changes :');

		currentDate = getDate();
		currentTime = getTime();
		let addNotes = `Name: ${username} Current state: ${editTaskState}  Date and Time: ${currentDate}, ${currentTime}`;
		console.log('Addtional Notes: ', addNotes);
		newNotes = `\n${newNotes} \n\n${addNotes} \n\n${editTaskNotes}`;
		//newNotes = `\n${editTaskNotes} \n\n${newNotes} \n${addNotes}`;
		let newTaskNotes = newNotes;
		console.log('Notes: ', newTaskNotes);
		console.log('Now saving Task...');

		// if there is change in plan
		if (planChange) {
			console.log('Change of Plan: ', editTaskPlan);
			try {
				const response = await axios.put(
					'http://localhost:3000/tasks/update-task-withplan',
					{
						Task_id: currentTaskId,
						Task_plan: editTaskPlan,
						Task_state: editTaskState,
						Task_app_Acronym: editTaskAppAcronym,
						Task_notes: newTaskNotes,
						Task_owner: username,
						Purpose: purpose,
						Previous_state:oldState,
						Task_creator: taskCreator
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						withCredentials: true // Include cookies with the request
					}
				);
				if (response.status == 200) {
					successMessage = 'Changes has been saved successfully';
					addToast({
						message: successMessage,
						type: 'success',
						dismissible: true,
						timeout: 1000
					});
					removeEmptyPlan();
					//set flags back to normal
					planChange = false;
					resetPermitAndGroups();
					resetInputStates();
					dispatch('close');
				}
			} catch (error) {
				console.error('Error updating task:', error);
				if (error.response.data.message == 'Access denied.') {
					goto('/');
				}
				if(error.response.status==403){
					errorMessage = 'Unauthorized to edit task';
					addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 1000
				});
				dispatch('close');
				}
				if(error.response.status==500){
					errorMessage = 'Server unable to process task data';
					addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 1000
				});
				dispatch('close');
				}
			}
		} else {
			console.log('Updating task with new state');
			try {
				const response = await axios.put(
					'http://localhost:3000/tasks/update-task',
					{
						Task_id: currentTaskId,
						Task_state: editTaskState,
						Task_app_Acronym: editTaskAppAcronym,
						Task_notes: newTaskNotes,
						Task_owner: username,
						Purpose: purpose,
						Previous_state:oldState,
						Task_creator: taskCreator
					},
					{
						headers: {
							'Content-Type': 'application/json'
						},
						withCredentials: true // Include cookies with the request
					}
				);
				if (response.status == 200) {
					successMessage = 'Changes has been saved successfully';
					addToast({
						message: successMessage,
						type: 'success',
						dismissible: true,
						timeout: 1000
					});
					removeEmptyPlan();
					//set flags back to normal
					planChange = false;
					resetPermitAndGroups();
					dispatch('close');
				}
			} catch (error) {
				console.error('Error updating the task:', error);
				if (error.response.data.message == 'Access denied.') {
					goto('/');
				}
				if(error.response.status==403){
					errorMessage = 'Unauthorized to edit task'
					addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 1000
				});
				dispatch('close');
				}
				if(error.response.status==500){
					errorMessage = 'Server unable to process task data';
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
	}

	//fetch info for the task
	async function fetchTask() {
		console.log('Fetching task: ');
		console.log('Task id: ', editTask.Task_id);
		console.log('List of Plan Names: ', planNames);
		try {
			const response = await axios.post(
				'http://localhost:3000/tasks/get-task',
				{
					Task_id: editTask.Task_id
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);
			if (response.status == 200) {
				fetchCurrentTask = response.data[0];
				console.log('Task fetched: ', fetchCurrentTask);
				currentTaskId = fetchCurrentTask.Task_id;
				editTaskAppAcronym = fetchCurrentTask.Task_app_Acronym;
				editTaskName = fetchCurrentTask.Task_name;
				editTaskDescription = fetchCurrentTask.Task_description;
				editTaskNotes = fetchCurrentTask.Task_notes;
				editTaskPlan = fetchCurrentTask.Task_plan;
				initialPlan= fetchCurrentTask.Task_plan;
				editTaskState = fetchCurrentTask.Task_state;
				oldState=fetchCurrentTask.Task_state;
				editTaskOwner = fetchCurrentTask.Task_owner;
				taskCreator = fetchCurrentTask.Task_creator;
				taskCreatedDate = fetchCurrentTask.Task_createDate;
				console.log('Task plan: ', editTaskPlan);
			}
			addEmptyPlan();
		} catch (error) {
			console.log('Error fetching task: ', error);
		}
	}

	function closeEditTaskModal() {
		removeEmptyPlan();
		console.log('Close Edit Task Window');
		dispatch('close');
	}

	onMount(() => {
		fetchTask();
		GetProfile();
		// getPlans();
	});
</script>
<div class="backgroundDiv">

<!-- Modal Header -->
<div class="modal">
	<div class="header">Task Detail</div>

	<!-- Content Section (Left and Right Columns) -->
	<div class="content">
		<!-- Left Column -->
		<div class="left-column">
			<!-- Upper Div (ID, Name, Description) -->
			<div class="details">
				<p><strong>ID:</strong> {currentTaskId}</p>
				<p><strong>Name:</strong> {editTaskName}</p>
				<p class="task-description"><strong>Description:</strong>{editTaskDescription}</p>
			</div>

			<!-- Lower Div (State, Plan, Creator, Owner, Created Date) -->
			<div class="details">
				<p><strong>State:</strong> {editTaskState}</p>
				<p>
					<strong>Plan:</strong>
					{#if showPlanList}
						<select bind:value={editTaskPlan} on:change={handlePlanChange} disabled={statePlan==false}>
							
							{#each planNames as plan}
								<option value={plan}>{plan}</option>
							{/each}
						</select>
					{/if}
				</p>
				<p><strong>Creator:</strong> {taskCreator}</p>
				<p><strong>Owner:</strong> {editTaskOwner}</p>
				<p><strong>Created date:</strong> {taskCreatedDate}</p>
			</div>
		</div>

		<!-- Right Column -->
		<div class="right-column">
			<div class="notes-container">
				<h3>Notes:</h3>
				<!-- Non-editable Notes Field -->
				<!--<div class="notesfield">-->
				<textarea class="notesfield" disabled>{editTaskNotes}</textarea>

				<!--</div>-->
				<!-- Editable Textbox -->
				<textarea
					bind:value={newNotes}
					placeholder="Enter notes here..."
					on:change={(e) => (notesChange = true)} disabled={stateNotes==false}
				></textarea>
			</div>

			<!-- Buttons -->
			<div class="button-container">
				<button class="btn" id="closeBtn" on:click={closeEditTaskModal}>Close</button>
				<button class="btn" id="saveBtn" on:click={saveChangesTask} disabled={stateSaveChanges==false}>{saveBtnLabel}</button>
				<button class="btn" id="demoteBtn" on:click={demoteTask} disabled={stateDemote == false}>{demoteBtnLabel}</button>
				<button class="btn" id="promoteBtn" on:click={promoteTask} disabled={statePromote == false}>{promoteBtnLabel}</button>
			</div>
		</div>
	</div>
</div>
</div>
<style>

	.backgroundDiv{
		position: fixed;
		top: 0;
		left: 0%;
		padding: 1rem;
		width: 100%;
		height:100%;
		background-color: rgba(17, 17, 17, 0.588);
	}

	.modal {
		position: fixed;
		top: 5;
		left: 8%;
		padding: 20px;
		width: 85%;
		height: 780px;
		border: 1px solid #ccc;
		background-color: white;
		justify-content: center;
		align-items: center;
	}

	.content {
		display: flex;
		background-color: white;
	}

	.header {
		background-color: white;
		font-size: 1.5rem;
		font-weight: bold;
		text-align: left;
		margin-bottom: 1rem;
	}

	.left-column {
		width: 25%; /* 1/4 space */
		padding-right: 1rem;
		border: 1px solid #ccc;
		background-color: white;
	}

	.right-column {
		width: 75%; /* 3/4 space */
		padding-left: 1rem;
		border: 1px solid #ccc;
		background-color: white;
	}

	.details {
		margin-bottom: 1rem;
		background-color: white;
	}

	.details .task-description{
		word-wrap: break-word;
		overflow-y: auto;
	}

	.notes-container {
		margin-bottom: 1rem;
		background-color: white;
	}

	.notesfield {
		border: 1px solid #ccc;
		width: 97.2%;
		padding: 10px;
		height: 450px;
		margin-bottom: 10px;
		background-color: white;
	}

	textarea {
		width: 99.5%;
		height: 100px; /* Set to 4 rows */
		resize: none; /* Prevent resize */
		overflow-y: scroll;
		margin-bottom: 1rem;
	}

	.button-container {
		display: flex;
		gap: 10px;
		justify-content: flex-end;
		padding-bottom: 15px;
		background-color: white;
	}

	.btn {
		padding: 10px 20px;
		border: none;
		border-radius: 5px;
		font-size: 10px;
		background-color: #007bff;
		color: white;
	}

	#closeBtn {
		background-color: #fefefe;
		color: blue;
		border: 1px solid #ccc;
	}

	#demoteBtn {
		background-color: #929292;
		color: rgb #ccc;
		border: 1px solid #0b0b0b;
	}

	#saveBtn {
		background-color: #020202;
		color: rgb #ccc;
		border: 1px solid #1c1c1c;
	}

	/* Disabled button style */
	.btn:disabled {
		background-color: lightgrey;
		color: #666;
		cursor: not-allowed;
	}
</style>
