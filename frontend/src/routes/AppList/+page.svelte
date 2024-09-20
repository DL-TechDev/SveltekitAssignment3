<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import axios from 'axios';
	//import TopNavBar from '../../components/NavBar.svelte';
	import TopNavBar from '../../components/NavBar.svelte';

  let apps = [
    { name: "App Acronym", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. some random description", number: "<r number>" },
    { name: "App name 2", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. some random description", number: "123" }
  ];
  let pageName = 'App List';
  let username = '';
  let groupname='Admin';
  let activeStatus;
  let isAdmin = false;

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
			const response = await axios.get(
				'http://localhost:3000/user/user-group-name',{
        		params: { User_name: username }, // Use 'params' to pass query parameters
        		withCredentials: true // Include cookies with the request
      		});
        if (response.status === 200) {
              //console.log("We are in the response status 200");
              const data = response.data;
			  // check the data return is an array
              if (Array.isArray(data)) 
              {
                // Check if any of the group's names match the provided group name
                const isInGroup = data.some(group => group.Group_name === groupname);
                if(isInGroup)
              {
                  isAdmin=true;
                  return true;
              }
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

  	// Call the function on component mount
	onMount(() => {
		GetProfile();
	});

</script>

<TopNavBar {pageName} {username} {isAdmin} />

<div class="app-cards">
	{#each apps as app}
		<div class="app-card">
			<h3>{app.name}</h3>
			<p>{app.description}</p>
			<p>{app.number}</p>
			<a href="#" class="view-link">View</a>
		</div>
	{/each}
</div>

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
	}

	.view-link {
		text-align: right;
		display: block;
		color: #007bff;
		text-decoration: none;
		font-weight: bold;
	}
</style>
