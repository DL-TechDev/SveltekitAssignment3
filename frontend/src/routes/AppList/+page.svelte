<script>
  let apps = [
    { name: "App Acronym", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. some random description", number: "<r number>" },
    { name: "App name 2", description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. some random description", number: "123" }
  ];
  let userName = "Admin"; // Change this to whatever your dynamic username is


    function handleLogout() {
        // Add your logout logic here, e.g., calling an API or clearing user session data
        window.location.href = '/';
    }



</script>

<style>
  .app-list-header {
    background-color: #e0e0e0;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: relative;
  }

  .app-list-header h1 {
    margin: 0;
  }

  .user-info {
    position: relative;
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .user-icon {
    width: 35px;
    height: 35px;
    background-color: #666;
    border-radius: 50%;
    margin-left: 10px;
  }

  .dropdown {
    display: none;
    position: absolute;
    top: 30px;
    right: 0;
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

<div class="app-list-header">
  <h1>App List</h1>
  <div class="user-info">
    <span>{userName}</span>
    <div class="user-icon"></div>
    <!-- Dropdown Menu -->
    <div class="dropdown">
      <a href="/profile">View/Edit Profile</a>
      <a href="/user-management">User Management</a>
      <a href="/logout">Logout</a>
    </div>
  </div>
</div>

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
