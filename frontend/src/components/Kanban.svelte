<script>
    let tasks = [
        { id: 1, name: 'Task 1', status: 'Open', owner: 'User A' },
        { id: 2, name: 'Task 2', status: 'Todo', owner: 'User B' },
        { id: 3, name: 'Task 3', status: 'Doing', owner: 'User C' },
        { id: 4, name: 'Task 4', status: 'Done', owner: 'User D' },
        { id: 5, name: 'Task 5', status: 'Close', owner: 'User E' }
    ];

    let columns = ['Open', 'Todo', 'Doing', 'Done', 'Close'];
</script>

<style>
    .kanban-board {
        display: flex;
        gap: 10px;
        margin-top: 20px;
    }

    .kanban-column {
        flex: 1;
        background-color: #f5f5f5;
        padding: 10px;
        border: 1px solid #ccc;
        border-radius: 8px;
    }

    .kanban-column h3 {
        text-align: center;
        font-size: 1.2em;
        margin-bottom: 10px;
    }

    .task-card {
        background-color: white;
        border: 1px solid #ccc;
        border-left: 4px solid;
        border-radius: 5px;
        padding: 10px;
        margin-bottom: 10px;
    }

    .task-card p {
        margin: 0 0 5px;
    }

    .task-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 0.9em;
        color: #555;
    }

    .task-footer a {
        color: #007bff;
        cursor: pointer;
        text-decoration: none;
    }

    /* Column Header Colors */
    .Open h3 {
        color: #1e90ff;
    }

    .Todo h3 {
        color: #f4c430;
    }

    .Doing h3 {
        color: #ff6347;
    }

    .Done h3 {
        color: #32cd32;
    }

    .Close h3 {
        color: #696969;
    }

    /* Task Card Colors */
    .Open .task-card {
        border-left-color: #1e90ff;
    }

    .Todo .task-card {
        border-left-color: #f4c430;
    }

    .Doing .task-card {
        border-left-color: #ff6347;
    }

    .Done .task-card {
        border-left-color: #32cd32;
    }

    .Close .task-card {
        border-left-color: #696969;
    }

    /* Header section */
    .kanban-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #ccc;
    }

    .header-buttons button {
        padding: 8px 12px;
        margin-left: 8px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 5px;
        cursor: pointer;
    }

    .header-buttons button:last-child {
        background-color: #17a2b8;
    }

    .header-profile {
        display: flex;
        align-items: center;
    }

    .header-profile span {
        margin-right: 10px;
        font-weight: bold;
    }

    .header-profile img {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: #ccc;
    }
</style>

<!-- Header Section -->
<div class="kanban-header">
    <h1>Kanban (app_name)</h1>
    <div class="header-buttons">
        <button>Create Task</button>
        <button>Plan</button>
    </div>
    <div class="header-profile">
        <span>PL</span>
        <img src="/path/to/profile-pic.png" alt="Profile" />
    </div>
</div>

<!-- Kanban Board -->
<div class="kanban-board">
    {#each columns as column}
        <div class="kanban-column {column}">
            <h3>{column}</h3>
            {#each tasks.filter(task => task.status === column) as task}
                <div class="task-card">
                    <h4>{task.name}</h4>
                    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit...</p>
                    <div class="task-footer">
                        <span>{task.owner}</span>
                        <a>View</a>
                    </div>
                </div>
            {/each}
        </div>
    {/each}
</div>
