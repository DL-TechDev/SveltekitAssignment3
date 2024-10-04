<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	//import TopNavBar from '../../components/NavBar.svelte';
	import TopNavBar from '../../components/NavBar.svelte';
	import CreateAppModal from '../../components/CreateAppModal.svelte';
	import EditAppModal from '../../components/EditAppModal.svelte';
	export let userGroup = 'pl'; // temp allow pl group to access
	import { appAcronymStore } from '$lib/stores'; // Import the store
	import Toast from '../../components/Toast.svelte';
	
	let pageName = 'App List';
	let username = '';
	let groupname='Admin';
	let activeStatus;
	let isAdmin = false;
	let isPL = false;
	
	let appList = []; // container for list
	let appListNames = []; // container to hold the app acronym
  	let showModal = false;

	let successMessage='';
    let errorMessage='';

    function handleAppCreated(event) {
        //const newApp = event.detail;
		//appList = [...appList, newApp];  // Add new app to the list
		GetApps();
        showModal = false;  // Close the modal
    }

    function openModal() {
        showModal = true;
    }

    function closeModal() {
        showModal = false;
    }

	export async function GetApps () {
		try {
			const response = await axios.get('http://localhost:3000/tasks/get-all-apps', {
				withCredentials: true
			});
			if(response.status==200){
				appList = response.data;
				console.log("List fetched: ",appList);
				appListNames = [...appList.map((app)=>app.App_Acronym)];
				console.log("List of App Names: ",appListNames);
			}
		} catch (error){
			console.error('Error fetching apps:', error);
			goto('/error'); // Use goto for navigation
		}
	}

  export async function GetProfile () {
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
          			checkgroup(username,groupname);
			} else {
				// unable to fetch data
				goto('/error');
			}
		} catch (error) {
			console.error('Error fetching profile:', error);
			//errorMessage = 'An error occurred while fetching user profile.';
			goto('/error'); // Use goto for navigation
		}
		if (activeStatus==0) {
			console.log('Inactive Account');
			goto('/');
		}
	}

  export async function checkgroup (username, groupname) {
    //const isInGroup
		try {
			const response = await axios.post(
				'http://localhost:3000/user/user-group-name',{
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
			  //console.log("Groupname: ",data);
			  // check the data return is an array
              if (Array.isArray(data)) 
              {
				 for (const group of data) {
                    if (group.Group_name.toLowerCase() === 'admin') {
                        isAdmin = true; // Set isAdmin to true if 'admin' group is found
                    }
                    if (group.Group_name.toLowerCase() === 'pl') {
                        isPL = true; // Set isUser to true if 'user' group is found
                    }
                    // Break early if both flags are set to true
                    if (isAdmin && isPL) {
                        break;
                    }
                }
            //     // Check if any of the group's names match the provided group name
            //     const isInGroup = data.some(group => group.Group_name === groupname);
            //     if(isInGroup)
            //   {
            //       isAdmin=true;
            //       return true;
            //   }
              } else 
              {
                console.error('Unable to check data');
                return false; // Return false 
                }
        } else {
            // unable to fetch data
            goto('/error');
        }
    } catch (error) {
			console.error('Error fetching profile:', error);
			//errorMessage = 'An error occurred while fetching user profile.';
			goto('/error'); // Use goto for navigation
		}
	}

	//Edit....

  	let showEditModal = false;
	let selectedApp = null; 

	// this function updates the list of apps in the parent page
	export async function handleEditModal(event){
		GetApps();
        showEditModal = false;  // Close the modal
	}

	export function handleView(app){
		const app_Acronym = app.App_Acronym;
		appAcronymStore.set(app_Acronym);
		goto('/task-management');
	}

	function openEditModal(app){
		selectedApp = app;
		console.log("App selected: ",selectedApp);
		showEditModal=true;
	}

	function closeEditModal(){
		console.log("Closing the Edit App window");
		selectedApp = null;
		showEditModal = false;
		//
	}

  	// Call the function on component mount
	onMount(() => {
		GetProfile();
		GetApps();
	});

</script>

<TopNavBar {pageName} {username} {isAdmin} />

<!-- Create App button will only appears if its PL-->
{#if isPL}
<div class="App-button">
<button class="btn-primary" on:click="{openModal}">Create App</button>
</div>
<!---Display of Cards---->
{/if}
<div class="app-cards">
	<!--{#each apps as app}-->
	{#each appList as app}
		<div class="app-card">
			<h3>{app.App_Acronym}</h3>
			<p>{app.App_Description}</p>
			<p>{app.App_Rnumber}</p>
			<div class="link">
				{#if isPL}
				<a href="#" on:click="{() => openEditModal(app)}">Edit</a>
				{/if}
				<a href="#" on:click="{() => handleView(app)}">View</a>
			</div>
		</div>
	{/each}
</div>

<!-- Modal Component -->
{#if showModal}
    <CreateAppModal {appListNames} on:close={closeModal} on:appCreated={handleAppCreated} />
{/if}

<!-- Edit Component -->
{#if showEditModal}
    <EditAppModal {selectedApp} on:close={closeEditModal} on:appEdited={handleEditModal} />
{/if}

<Toast/>

<style>
	.app-cards {
		display: flex;
		gap: 20px;
		margin: 20px;
	}

	.app-card {
		border: 1px solid #d0d0d0;
		padding: 10px;
		width: 200px;
	}

	.app-card h3 {
		font-style: italic;
		margin: 0;
	}

	.app-card p {
		font-size: 0.9em;
		color: #666;
		max-height: 100px; /* Set the maximum height for the paragraph */
    	overflow-y: auto;  /* Enable vertical scrolling if content exceeds max height */
    	white-space: pre-wrap; /* Allow text to wrap to new lines */
    	word-wrap: break-word; 
	}

	.link{
		display: block;
		text-align: right;
		font-weight: bold;
	}

	.btn-primary {
        background-color: #007bff; /* Blue color */
        color: white;              /* White text */
        border: none;
        border-radius: 10px;       /* Rounded corners */
        padding: 10px;        /* Padding for a better look */
        cursor: pointer;
        font-size: 16px;
        text-align: center;
        transition: background-color 0.3s ease;
    }

	.App-button {
		display: flex;
		justify-content: flex-end; /* Align items to the right */
		padding: 10px;
	}
</style>
