<script>
    import { createEventDispatcher } from "svelte";
    import Toast from '../../components/Toast.svelte';
    import { addToast } from '../../components/store';
    import axios from "axios";
    export let visible = false;
    export let onClose = () => {};
    export let onAddGroup = (groupName) => {};
    export let groups = [];
    import { goto } from "$app/navigation";
    let errorMessage = '';
    let successMessage='';
  
    //const dispatch = createEventDispatcher();
    let groupName = '';
  
    const handleAddGroup = () => {
        addGroup();
        onClose();

        // if (groupName.trim()) {
        //     onAddGroup(groupName);
        //     groupName = ''; // Clear the input field
        //     onClose();
        // }
    };
  
    const handleClose = () => {  
      onClose();
    };

    const addGroup = async () => {
       if(groups.includes(groupName)) 
       {
        errorMessage = 'Group Already exist';
				addToast({
					message: errorMessage,
					type: 'error',
					dismissible: true,
					timeout: 3000
				});
        return;
      }
		try {
			const response = await axios.post(
				'http://localhost:3000/user/addGroup',
				{
					Group_name: groupName
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
       successMessage = 'New Group added successfully';
				addToast({
					message: successMessage,
					type: 'success',
					dismissible: true,
					timeout: 3000
				});
        onAddGroup(groupName);
        groupName = ''; // Clear the input field
         onClose()
      }
			// Clear the form and reload the user list
		} catch (error) {
			console.error('Error adding group:', error);
      if(error.response.data.message == "Access denied.")
				{
					goto('/');
				}
		}
	};
  </script>
  
  {#if visible}
    <div class="popup-overlay">
      <div class="popup-content">
        <h3 id="popup-title">Add New Group Type</h3>
        <div class='inputGrpDiv'>
            <input class='inputGrpTxt' type="text" bind:value={groupName} placeholder="Enter group name" />
        </div>
        <div class="button-group">
          <button on:click={handleClose}>Close</button>
          <button on:click={handleAddGroup}>Add Group</button>
        </div>
      </div>
    </div>
  {/if}

  <Toast/>

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
      justify-content: space-between;
      margin-top: 10px;
    }
  
    button {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
    }

    .inputGrpTxt {
        font-size: 24px;
        padding: 10px;
        width: 75%;
        padding-left: 100px;
    }

    .error{
      color: red;
    }
  </style>

  