<script>
  // Sample data for users
  let users = [
    { username: 'Username1', password: 'xxxxxxxxxx', email: 'xxxxxxxxxxxxx', active: 'Select', group: 'Select group', isEditing: false },
    { username: 'Username2', password: 'xxxxxxxxxx', email: 'xxxxxxxxxxxxx', active: 'Yes', group: 'Project Lead', isEditing: false },
    { username: 'Username3', password: 'xxxxxxxxxx', email: 'xxxxxxxxxxxxx', active: 'Yes', group: 'Developer', isEditing: false }
  ];

  let newUser = { username: '', password: '', email: '', active: 'Select', group: 'Select group' };

  let showAddGroupPopup = false; // Toggle popup
  let newGroup = ''; // New group name input

  // Groups list (including the option to add new)
  let groups = ['Project Lead', 'Project Manager', 'Developer'];

  // Toggle editing mode for a specific user
  function toggleEdit(index) {
    users[index].isEditing = !users[index].isEditing;
  }

  // Save the edited user data
  function saveUser(index) {
    users[index].isEditing = false;
  }

  // Add new group to the group list
  function addGroup() {
    if (newGroup.trim()) {
      groups.push(newGroup);
      newGroup = '';
      showAddGroupPopup = false;
    }
  }

  // Add a new user row
  function addUser() {
    if (newUser.username && newUser.password && newUser.email && newUser.active && newUser.group) {
      users.push({ ...newUser, isEditing: false });
      newUser = { username: '', password: '', email: '', active: 'Select', group: 'Select group' };
    }
  }
</script>

<style>
  .user-management-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #e0e0e0;
    padding: 10px;
  }

  .user-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 20px;
  }

  .user-table th, .user-table td {
    padding: 12px;
    border-bottom: 1px solid #ccc;
    text-align: left;
  }

  .add-group-btn {
    background-color: #007bff;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }

  .edit-btn, .cancel-btn, .save-btn {
    color: red;
    cursor: pointer;
  }

  .popup {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: white;
    padding: 20px;
    border: 1px solid #ccc;
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
    z-index: 10;
  }

  .popup-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
  }
</style>

<div class="user-management-header">
  <h1>User Management</h1>
  <button class="add-group-btn" on:click={() => (showAddGroupPopup = true)}>Create New Group</button>
</div>

<!-- User Table -->
<table class="user-table">
  <thead>
    <tr>
      <th>Username</th>
      <th>Password</th>
      <th>Email</th>
      <th>Active</th>
      <th>Group</th>
      <th>Action</th>
    </tr>
  </thead>
  <tbody>
    {#each users as user, index}
      <tr>
        <td>
          {#if user.isEditing}
            <input type="text" bind:value={user.username} />
          {:else}
            {user.username}
          {/if}
        </td>
        <td>
          {#if user.isEditing}
            <input type="password" bind:value={user.password} />
          {:else}
            {user.password}
          {/if}
        </td>
        <td>
          {#if user.isEditing}
            <input type="email" bind:value={user.email} />
          {:else}
            {user.email}
          {/if}
        </td>
        <td>
          {#if user.isEditing}
            <select bind:value={user.active}>
              <option>Select</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          {:else}
            {user.active}
          {/if}
        </td>
        <td>
          {#if user.isEditing}
            <select bind:value={user.group}>
              <option>Select group</option>
              {#each groups as group}
                <option>{group}</option>
              {/each}
            </select>
          {:else}
            {user.group}
          {/if}
        </td>
        <td>
          {#if user.isEditing}
            <a class="cancel-btn" on:click={() => toggleEdit(index)}>Cancel</a> | 
            <a class="save-btn" on:click={() => saveUser(index)}>Save</a>
          {:else}
            <a class="edit-btn" on:click={() => toggleEdit(index)}>Edit</a>
          {/if}
        </td>
      </tr>
    {/each}

    <!-- Add New User Row -->
    <tr>
      <td><input type="text" placeholder="Username" bind:value={newUser.username} /></td>
      <td><input type="password" placeholder="Password" bind:value={newUser.password} /></td>
      <td><input type="email" placeholder="Email" bind:value={newUser.email} /></td>
      <td>
        <select bind:value={newUser.active}>
          <option>Select</option>
          <option>Yes</option>
          <option>No</option>
        </select>
      </td>
      <td>
        <select bind:value={newUser.group}>
          <option>Select group</option>
          {#each groups as group}
            <option>{group}</option>
          {/each}
        </select>
      </td>
      <td><a class="save-btn" on:click={addUser}>Add User</a></td>
    </tr>
  </tbody>
</table>

<!-- Add Group Popup -->
{#if showAddGroupPopup}
  <div class="popup">
    <h2>Add New Group</h2>
    <input type="text" placeholder="Group Name" bind:value={newGroup} />
    <div class="popup-buttons">
      <button on:click={() => (showAddGroupPopup = false)}>Close</button>
      <button on:click={addGroup}>Create Group</button>
    </div>
  </div>
{/if}
