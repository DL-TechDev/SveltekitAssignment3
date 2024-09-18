<script>
	export let username = ''; // Username passed as a prop
	export let pageName = '';
  export let isAdmin=false;
	import logo from '$lib/assets/user.png';
  import { goto } from '$app/navigation';
  import axios from 'axios';

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

  function goProfilePage() {
        goto('/profile');
    }

  function goUserManagement() {

        goto('/user-management');
    }

  function handleLogout() {
        logout();
        goto('/');
    }

</script>

<nav class="navbar">

	<div class="navbar-left">
		<span class="pagename">{pageName}</span>
	</div>
  
  <div class="user-info">
    <div class="navbar-right">
      <span class="username">{username}</span>
      <img alt="logo" id="logo" src={logo} width="30" height="30" /><br/>
    </div>
    <!-- Dropdown Menu -->
    <div class="dropdown">
      <a href="/profile" on:click={goProfilePage}>View/Edit Profile</a>
      {#if (isAdmin)}
      <a href="/user-management" on:click={goUserManagement}>User Management</a>
      {/if}
      <a href="/" on:click={handleLogout}>Logout</a>
    </div>
  </div>
</nav>

<style>
	.navbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		background-color: #e2e2e2ed;
		color: black;
    font-size: 20px;
	}

	.navbar-left {
		margin-right: auto; /* Pushes content to the left */
	}

	.navbar-right {
    display: flex;
		margin-left: center; /* auto Pushes content to the right */
    position: relative; /* To position the dropdown menu */
    cursor: pointer;
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

  .dropdown {
    display: none;
    position: absolute;
    top: 50px;
    right: 30px;
    background-color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    z-index: 100;
    min-width: 200px;
    border: 1px solid #ccc; /* Optional, for better visibility of bounds */
}

  .dropdown a {
    display: block;
    padding: 10px 16px;
    text-decoration: none;
    color: #333;
    font-weight: normal;
    border-bottom: 1px solid #f0f0f0;
  }

  .dropdown a:hover {
    background-color: #f0f0f0;
  }

  .dropdown a:last-child {
    border-bottom: none;
  }

  .user-info:hover .dropdown {
    display: block;
  }
</style>
