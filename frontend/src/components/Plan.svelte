<script>
    import {createEventDispatcher, onMount} from "svelte";
    import axios from 'axios';
    import { goto } from "$app/navigation";
	import { validateGroupName } from "../utils/validators";
    import { addToast } from "./store";

    let successMessage='';
    let errorMessage='';
    export let newPlan=null; 

    export let planNames=null; //get the plan list from the tm

    let name = '';
    let acronym ='';
    let startDate = '';
    let endDate = '';
    let color = '#ff0000'; // Default color is red
    let hexStr='#';
    let errorMsg = false;

    // Reference for inputs 
	let planNameInput;
	let planStartDateInput;
	let planEndDateInput;
	let planColor;

    export let appAcronym =null;

    const dispatch = createEventDispatcher();

    const handleSubmit = () => {
        // Do validation or further processing
        const newPlan = { name, startDate, endDate, color };
        //closeModal(newPlan); // Pass back the data to the parent component
    };

    function closeCreatePlanModal(){
        resetCreatePlanVariables();
        dispatch('close');
    }

    function resetCreatePlanVariables(){
        name='';
        startDate='';
        endDate='';
        color='#ff0000';
    }

    function validateFields(){
        errorMessage='';
        if(!name)
        {
            errorMsg = true;
            planNameInput.focus();
            return errorMessage="Plan name cannot be empty";
        }
        if(!validateGroupName(name))
        {
            errorMsg = true;
            planNameInput.focus();
            return errorMessage="Only Alphabets and numeric allowed";
        } 
        if(planNames.includes(name))
        {
            errorMsg = true;
            planNameInput.focus();
            return errorMessage="Duplicate Plan Names";
        }
        if(name.length>64)
        {
            errorMsg = true;
            planNameInput.focus();
            return errorMessage="Exceed max characters";
        }
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
        if(appAcronym==='')
            goto('/task-management');
        else {
            errorMessage='';
            createPlan();
        }
    }

    async function createPlan(){
        console.log("Create Plan");
        console.log("appAcronym: ",appAcronym);
        let editColour=color.substring(1);
        // const newPlan={
        //     name,
        //     appAcronym,
        //     startDate,
        //     endDate,
        //     editColour
        // };
        // console.log(newPlan);
        try{
            const response = await axios.post('http://localhost:3000/tasks/create-plan',
                {
                    Plan_MVP_name: name,
					Plan_app_Acronym: appAcronym,
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
                console.log("Plan Created!");
                //dispatch('planCreated', newPlan);
                successMessage = 'Plan created successfully'
				addToast({
				message: successMessage,
				type: 'success',
				dismissible: true,
				timeout: 1000
			});
            dispatch('planCreated');
            }

        } catch (error){
            console.error('Error creating the plan', error);
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


</script>


<div class="modal-overlay">
        <div class="modal-content" on:click|stopPropagation>
            <h2>Create Plan</h2>
            <form on:submit|preventDefault="{handleSubmit}">
                <div class="form-group">
                    <label for="name">Name:</label>
                    <input id="name" type="text" bind:value="{name}"  bind:this={planNameInput}/>
                </div>

                <div class="form-group">
                    <label for="start">Start date:</label>
                    <input id="start" type="date" bind:value="{startDate}" bind:this={planStartDateInput}/>
                </div>

                <div class="form-group">
                    <label for="end">End date:</label>
                    <input id="end" type="date" bind:value="{endDate}" bind:this={planEndDateInput}>
                </div>

                <div class="form-group color-picker">
                    <label for="color">Color:</label>
                    <input id="color" type="color" bind:value="{color}" bind:this={planColor}/>
                </div>

                {#if errorMsg}
                        <div class="error-message" style="color: red; margin-top: 5px;">{errorMessage}</div>
                 {/if}

                <div class="modal-buttons">
                    <button type="button" class="close-button" on:click={closeCreatePlanModal}>Close</button>
                    <button type="submit" class="create-button" on:click={validateFields}>Create Plan</button>
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
</style>
