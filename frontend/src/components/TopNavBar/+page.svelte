<script>
	export let username = ''; // Username passed as a prop
	export let pageName = '';
	import logo from '$lib/assets/user.png';
  import { goto } from '$app/navigation';
  import axios from 'axios';
  import { onMount, onDestroy } from 'svelte'

  // State for dropdown visibility
  let isDropdownOpen = false;

const logout = async () => {
		try {
			const response = await axios.post(
				'http://localhost:3000/auth/logout',
				{
				},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true // Ensure cookies are included in requests
				}
			);
			// If logout is successful, navigate to the profile page
			goto('/'); // Use goto for navigation
		} catch (error) {
			console.error('Logout error:', error);
		}
	};

 
  let toggleDropup = false // default state (dropdown close)

  // Function to toggle dropdown visibility
  //handleDropdownClick
  const toggleDropdown = () => {
    isDropdownOpen = !isDropdownOpen;
  }

   // Close the dropdown when clicking outside of it
  const handleClickOutside = (event) => {
    if (event.target.closest('.navbar-right') === null) {
      isDropdownOpen = false;
    }
  };
  /*
   // Add event listener for clicks outside when component is mounted
  onMount(() => {
    document.addEventListener('click', handleClickOutside);
  });

  // Remove event listener when component is destroyed
  onDestroy(() => {
    document.removeEventListener('click', handleClickOutside);
  });
*/
</script>

<nav class="navbar">

	<div class="navbar-left">
		<span class="pagename">{pageName}</span>
	</div>
  
	<div class="navbar-right">
		<span class="username">{username}</span>
    <img alt="logo" src={logo} width="30" height="30" /><br/>
    <button on:click={logout}>Logout</button>
  </div>
</nav>


<style>
	.navbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px;
		background-color: #e2e2e2ed;
		color: black;
	}

	.navbar-left {
		margin-right: auto; /* Pushes content to the left */
	}

	.navbar-right {
    display: flex;
		margin-left: center; /* auto Pushes content to the right */
    position: relative; /* To position the dropdown menu */
	}

	.username {
		font-weight: bold;
    margin-top: 5px;
    margin-right: 10px;
    cursor: pointer; /* Indicate that the username is clickable */
	}

  .pagename{
    font-weight: bold;
    font-size: 20px
  }

   .dropdown-menu {
    display: none; /* Hidden by default */
    position: absolute;
    top: 100%; /* Position below the username */
    right: 0; /* Align with the right edge of the parent */
    background-color: white;
    color: black;
    border: 1px solid #ddd;
    border-radius: 5px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    padding: 10px;
    z-index: 10;
  }

  .dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  background: none;
}

  .dropdown-item:hover {
    background-color: #f0f0f0;
  }

  .dropdown-item:hover {
      background-color: #f0f0f0;
  }
</style>
