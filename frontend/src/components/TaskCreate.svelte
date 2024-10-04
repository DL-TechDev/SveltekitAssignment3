<script>
    import { createEventDispatcher, onMount } from 'svelte';
	import axios from 'axios';
	import MultiSelect from 'svelte-multiselect';
    import {validateEmpty, validateGroupName, validateName} from "../utils/validators";
    import { goto } from '$app/navigation';
	import { appAcronymStore } from '$lib/stores';
    import { writable } from 'svelte/store';
    import { toasts } from './store';
    import { addToast } from './store';

    export const rNumberStore = writable(null);
      // Automatically update when rNumber changes
    let rNumber = $rNumberStore;

    let successMessage='';
    let errorMessage='';
	let errorMsg=false;
	const regex = /^[0-9]+$/;

    const dispatch = createEventDispatcher();

    export let appAcronym=null;

    let task = {
        name: '',
        description: '',
        plan: '',
        notes: ''
    };

    let textTest = {
    notes: "\n\nName: Admin Current state: open Date and Time: 29-09-2024, 01:31 PM"
  };

    // Reference for task input focus
    let taskNameInput;
    let taskDescriptionInput;
    let taskPlanSelect;
    let purpose='task';
    let oldState='create';

    export let username=null; //import username

    export let userId=null; // import user id

    export let planNames=null; //import list of plan names 
    
    let availablePlans = ['Plan 1', 'Plan 2'];

    function closeTask() {
        // Logic for closing or navigating away
        console.log("Closing task form");
    }

    function closeModal(){
        dispatch('close');
    }

    function validateTaskForm(){
        if(!task.name)
        {
            errorMsg = true;
			taskNameInput.focus();
		    return errorMessage='Task Name is empty';
        }
        if(!validateGroupName(task.name))
		{
			errorMsg = true;
			taskNameInput.focus();
			return errorMessage='Only alphabet and numeric characters are allowed';
		}
        if(task.name.length>64)
        {
            errorMsg = true;
			taskNameInput.focus();
			return errorMessage='Character exceed limit';
        }
        if(task.description.length>255)
        {
            errorMsg = true;
			taskDescriptionInput.focus();
            console.log("Characters: ",task.description.length);
			return errorMessage='Character exceed limit';
        }
        console.log("Validation done.");
		console.log("Proceed to create task");
        getRnumber();
        createTask();
    }

    let currentDate = '';

    export function getDate(){
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        //currentDate = `${yyyy}-${mm}-${dd}`;
        let nowDate = `${dd}-${mm}-${yyyy}`;
        return nowDate;
    }

    let currentTime='';

    export function getTime(){
        const nowTime = new Date().toLocaleTimeString([],{hour: '2-digit', minute: '2-digit'});
        console.log("nowTime: ",nowTime);
        return nowTime;
    }

   // let rNumber;
    let appAcr='';

    async function getRnumber(){
        console.log("Get r_Number");
        console.log("appAcronym: ",appAcronym);
        try {
            const response = await axios.post('http://localhost:3000/tasks/get-rnumber',
                {
                    App_Acronym: appAcronym
                },
           	{
			    headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true //
				}
			);
            if(response.status===200)
            {
                const data = response.data;
                console.log("Data received: ",data);
                rNumber = data[0].App_Rnumber;
                console.log("rNumber : ",rNumber);
                rNumberStore.set(rNumber); // Store the value in the store
            }
            //dispatch('close',appAcronym);
        } catch (error){
            console.error('Error creating the application:', error);
			if (error.response.data.message == 'Access denied.') {
				goto('/');
			}
        }
    }

    async function createTask() {
        currentDate=getDate();
        currentTime=getTime();
        let currentState='open';
        let addNotes=`Name: ${username} Current state: ${currentState}  Date and Time: ${currentDate}, ${currentTime}`
		console.log("Addtional Notes: ",addNotes);
        task.notes = '\n'+`${task.notes}`+'\n'+`${addNotes}`;
        //let newTaskNotes = task.notes;
        //console.log("Notes: ",newTaskNotes);
       // console.log('Create Task');

		const newTask = {
			//Task_id: newTaskId,
			Task_name: task.name,
			Task_description: task.description,
			Task_notes: task.notes,
			Task_plan: task.plan,
			Task_app_Acronym: appAcronym,
			Task_state: currentState,
			Task_creator: username,
            Task_owner: username,
			Task_createDate: currentDate
		};
		console.log(newTask);

		try {
			const response = await axios.post(
				'http://localhost:3000/tasks/create-task',
				{
					//Task_id: newTaskId,
					Task_name: task.name,
					Task_description: task.description,
					Task_notes: task.notes,
					Task_plan: task.plan,
					Task_app_Acronym:  appAcronym,
					Task_state: currentState,
					Task_creator: username,
                    Task_owner: username,
					Task_createDate: currentDate,
                    Purpose: purpose,
					Previous_state:oldState
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true //
				}
			);
            if(response.status===200)
            {
                successMessage='Task added successfully';
                addToast({
				message: successMessage,
				type: 'success',
				dismissible: true,
				timeout: 1000
		        });
                dispatch('close');
            }
			//dispatch('taskCreated', newTask); // Notify parent that the app was created
		} catch (error) {
			console.error('Error creating the task:', error);
			if (error.response.data.message == 'Access denied.') {
				goto('/');
			}
            if(error.response.status==403){
					errorMessage = 'Unauthorized to create task';
					addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 1000
				});
				dispatch('close');
			}
            if(error.response.status==500)
            {
                console.log("Server is unable to create the task");
                errorMessage='Failed to create Task';
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
</script>
<div class="modal">
	<div class="modal-content">
            <h2>Create Task</h2>
            <form>
                <div class="form-row">
                    <label for="name">Name:</label>
                    <input id="name" type="text" bind:this={taskNameInput} bind:value={task.name} placeholder="Enter task name" />
                </div>

                <div class="form-row">
                    <label for="description">Description:</label>
                    <textarea id="description" bind:this={taskDescriptionInput} bind:value={task.description} placeholder="Enter task description" maxlength="255"></textarea>
                </div>

                <div class="form-row">
                    <label for="plan">Plan:</label>
                    <select id="plan" bind:this={taskPlanSelect} bind:value={task.plan}>
                        <option value="">Select</option>
                        {#each planNames as plan}
                            <option value={plan}>{plan}</option>
                        {/each}
                    </select>
                </div>

                <div class="form-row">
                    <label for="notes">Notes:</label>
                    <textarea id="notes" bind:value={task.notes} placeholder="Additional notes"></textarea>
                </div>

                {#if errorMsg}
                <div class="error-message" style="color: red; margin-top: 5px;">{errorMessage}</div>
                {/if}

                <div class="action-buttons">
                    <button type="button" on:click={closeModal} class="btn btn-secondary">Close</button>
                    <button type="button" on:click={validateTaskForm} class="btn btn-primary">Create Task</button>
                </div>
         </form>
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

    h2 {
        text-align: left;
        font-size: 1rem;
        margin-bottom: 1.5rem;
    }

    .form-row {
        display: flex;
        align-items: center;
        margin-bottom: 1.5rem;
    }

    .form-row label {
        flex: 0.45;
        font-size: 1rem;
        font-weight: 600;
    }

    .form-row input,
    .form-row textarea,
    .form-row select {
        flex: 2;
        padding: 0.5rem;
        font-size: 1rem;
        border: 1px solid #ccc;
        border-radius: 5px;
    }

    .form-row textarea {
		width: 99.5%;
        resize: none;
        height: 100px;
		overflow-y: scroll;
    }

    .action-buttons {
        display: flex;
        justify-content: flex-end;
    }

    .btn {
        padding: 0.75rem 1.5rem;
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
    }

    .btn-secondary {
        background-color: #f0f0f0;
        color: #333;
        margin-right: 1rem;
    }

    .btn-primary {
        background-color: #007bff;
        color: white;
    }

    .btn-primary:hover {
        background-color: #0056b3;
    }

    .btn-secondary:hover {
        background-color: #dcdcdc;
    }
</style>
