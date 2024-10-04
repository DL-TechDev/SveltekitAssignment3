<script>
    import { createEventDispatcher, onMount } from "svelte";
    import axios from 'axios';
    import { goto } from "$app/navigation";
    import { addToast } from "./store";

    export let isPM=false;
    let successMessage='';
    let errorMessage='';
    let name = '';
    let acronym ='';
    let startDate = '';
    let endDate = '';
    let color = '#ff0000'; // Default color is red
    let hexStr='#';

    let errorMsg=false;

    // Reference for inputs 
	let planStartDateInput;
	let planEndDateInput;
	let planColor;

    const handleSubmit = () => {
        // Do validation or further processing
        const newPlan = { name, startDate, endDate, color };
        //closeModal(newPlan); // Pass back the data to the parent component
    };

    export let editPlan; // receive for the plan

    const dispatch = createEventDispatcher();

    // plan fetch from parent page into the modal
    // populate in the form and disable name field
    // upon save, info send/api, close modal

    function closeEditPlanModal(){
        resetEditPlanVariables();
        dispatch('close');
    }

    function resetEditPlanVariables(){
        name='';
        startDate='';
        endDate='';
        color='#ff0000';
    }


    function incomingPlan(){
        console.log("IncomingPlan Function used");
        name=editPlan.Plan_MVP_name,
        acronym =editPlan.Plan_app_Acronym,
        startDate =editPlan.Plan_startDate,
        endDate =editPlan.Plan_endDate,
        color =hexStr+editPlan.Plan_colour,
        console.log("Start Date: ",startDate);
        console.log("EndDate: ",endDate);
    }

    async function handleEditPlan(){
		console.log('Edit Plan');
        let editColour=color.substring(1);
		try {
			const response = await axios.put('http://localhost:3000/tasks/edit-plan',
				{
					Plan_MVP_name: name,
					Plan_app_Acronym: acronym,
					Plan_startDate: startDate,
					Plan_endDate: endDate,
					Plan_colour: editColour
				},
                {
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);
			if(response.status==200)
            {
                console.log("Plan Updated!");
                successMessage = 'Plan updated successfully'
				addToast({
				message: successMessage,
				type: 'success',
				dismissible: true,
				timeout: 1000
			});
			dispatch('planEdited');
            }
		} catch (error){
			console.error('Error creating the application:', error);
			if (error.response.data.message == 'Access denied.') {
				goto('/');
			}
		}
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

    function validateFields(){
        errorMessage='';
        if(!startDate)
        {
            errorMsg = true;
            planStartDateInput.focus();
            return errorMessage="Start date must be selected";
        }
        if(!endDate)
        {
            errorMsg = true;
            planEndDateInput.focus();
            return errorMessage="End date must be selected";
        }
        if(!color)
        {
            errorMsg = true;
            planColor.focus();
            return errorMessage="Colour must be selected";
        }
        if(!validateDates(startDate,endDate))
		{
			errorMsg = true;
            planEndDateInput.focus();
		    return errorMessage='End date cannot be before start date';
		}
        else {
            errorMessage='';
            handleEditPlan();
        }
    }

    onMount(()=>{
        incomingPlan();
        console.log("EditPlan: ",editPlan);
    });
</script>

<div class="modal-overlay">
    <div class="modal-content" on:click|stopPropagation>
        <h2>Create Plan</h2>
            <form on:submit|preventDefault="{handleSubmit}">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input id="name" type="text" bind:value="{name}" disabled />
                </div>

                <div class="form-group">
                    <label for="start">Start date:</label>
                    <input id="start" type="date" bind:value="{startDate}" disabled={isPM==false} bind:this={planStartDateInput}/>
                </div>

                <div class="form-group">
                    <label for="end">End date:</label>
                    <input id="end" type="date" bind:value="{endDate}" disabled={isPM==false} bind:this={planEndDateInput}/>
                </div>

                <div class="form-group color-picker">
                    <label for="color">Colour:</label>
                    <input id="color" type="color" bind:value="{color}" disabled={isPM==false}/>
                </div>

                {#if errorMsg}
                        <div class="error-message" style="color: red; margin-top: 5px;">{errorMessage}</div>
                 {/if}

                <div class="modal-buttons">
                    <button type="button" class="close-button" on:click={closeEditPlanModal}>Close</button>
                    <button type="submit" class="create-button" on:click={validateFields} disabled={isPM==false}>Save Plan</button>
            </div>
        </form>
    </div>
</div>


<style>
    /* Modal styles */
    .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .modal-content {
        background: white;
        padding: 30px;
        border-radius: 8px;
        width: 400px;
        max-width: 90%;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
    }

    h2 {
        font-size: 1.5em;
        margin-bottom: 20px;
    }

    .form-group {
        margin-bottom: 15px;
    }

    label {
        display: block;
        margin-bottom: 5px;
        font-size: 1rem;
        font-weight: bold;
    }

    input[type="text"], 
    input[type="date"], 
    input[type="color"] {
        width: 100%;
        padding: 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
    }

    input[type="color"] {
        width: 20%;
        height: 35px;
        padding: 0;
    }

    /* Buttons styling */
    .modal-buttons {
        display: flex;
        justify-content: flex-end;
        gap: 10px;
        margin-top: 20px;
    }

    button {
        padding: 10px 20px;
        border: none;
        border-radius: 5px;
        font-size: 1rem;
        cursor: pointer;
    }

    .close-button {
        background-color: #f0f0f0;
        color: #333;
    }

    .create-button {
        background-color: #007bff;
        color: white;
    }

    button:hover {
        opacity: 0.9;
    }

    /* Disabled button style */
	button:disabled {
		background-color: lightgrey;
		color: #666;
		cursor: not-allowed;
	}
</style>
