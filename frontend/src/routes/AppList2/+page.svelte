<script>
	import logo from '$lib/assets/user.png';
	import TaskPopup from '../../components/TaskPopup.svelte';

	// Example task data with different states
	let tasks = [
		{
			id: 1,
			name: 'Task 1',
			description: 'Description for Task 1',
			owner: 'User A',
			state: 'Open'
		},
		{
			id: 2,
			name: 'Task 2',
			description: 'Description for Task 2',
			owner: 'User B',
			state: 'Todo'
		},
		{
			id: 3,
			name: 'Task 3',
			description: 'Description for Task 3',
			owner: 'User C',
			state: 'Doing'
		},
		{
			id: 4,
			name: 'Task 4',
			description: 'Description for Task 4',
			owner: 'User D',
			state: 'Done'
		},
		{
			id: 5,
			name: 'Task 5',
			description: 'Description for Task 5',
			owner: 'User E',
			state: 'Close'
		},
		{
			id: 6,
			name: 'Task 6',
			description: 'Description for Task 6',
			owner: 'User F',
			state: 'Open'
		},
		{
			id: 7,
			name: 'Task 7',
			description: 'Description for Task 7',
			owner: 'User G',
			state: 'Open'
		},
		{
			id: 8,
			name: 'Task 8',
			description: 'Description for Task 8',
			owner: 'User H',
			state: 'Open'
		},
		{
			id: 9,
			name: 'Task 9',
			description: 'Description for Task 9',
			owner: 'User I',
			state: 'Todo'
		},
		{
			id: 10,
			name: 'Task 10',
			description: 'Description for Task 10',
			owner: 'User J',
			state: 'Doing'
		}
	];

	// Helper function to filter tasks by their state
	const getTasksByState = (state) => tasks.filter((task) => task.state === state);
</script>

<!-- Header Section -->
<div class="kanban-header">
	<h1>Kanban (app_name)</h1>
	<div class="header-buttons">
		<button>Create Task</button>
		<button>Plan</button>
	</div>
	<div class="header-profile">
		<span class="username">PL</span>
		<img alt="logo" id="logo" src={logo} width="30" height="30" />
	</div>
</div>

<!-- Kanban Board Layout -->
<div class="kanban-board">
	<!-- Open Column -->
	<div class="kanban-column Open">
		<h2>Open</h2>
		<div class="task-list">
			{#each getTasksByState('Open') as task}
				<div class="task-card">
					<h3>{task.name}</h3>
					<p>{task.description}</p>
					<p class="task-owner">Owner: {task.owner}</p>
					<span class="view-link">View</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Todo Column -->
	<div class="kanban-column Todo">
		<h2>Todo</h2>
		<div class="task-list">
			{#each getTasksByState('Todo') as task}
				<div class="task-card">
					<h3>{task.name}</h3>
					<p>{task.description}</p>
					<p class="task-owner">Owner: {task.owner}</p>
					<span class="view-link">View</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Doing Column -->
	<div class="kanban-column Doing">
		<h2>Doing</h2>
		<div class="task-list">
			{#each getTasksByState('Doing') as task}
				<div class="task-card">
					<h3>{task.name}</h3>
					<p>{task.description}</p>
					<p class="task-owner">Owner: {task.owner}</p>
					<span class="view-link">View</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Done Column -->
	<div class="kanban-column Done">
		<h2>Done</h2>
		<div class="task-list">
			{#each getTasksByState('Done') as task}
				<div class="task-card">
					<h3>{task.name}</h3>
					<p>{task.description}</p>
					<p class="task-owner">Owner: {task.owner}</p>
					<span class="view-link">View</span>
				</div>
			{/each}
		</div>
	</div>

	<!-- Close Column -->
	<div class="kanban-column Close">
		<h2>Close</h2>
		<div class="task-list">
			{#each getTasksByState('Close') as task}
				<div class="task-card">
					<h3>{task.name}</h3>
					<p>{task.description}</p>
					<p class="task-owner">Owner: {task.owner}</p>
					<span class="view-link">View</span>
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* Header section styles */
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

	/* Kanban board and columns */
	.kanban-board {
		display: flex;
		justify-content: space-between;
		gap: 10px;
		margin-top: 20px;
	}

	.kanban-column {
		flex: 1;
		background-color: #f8f9fa;
		border-radius: 8px;
		padding: 10px;
		box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
		/* Scrollable column with max height */
		max-height: 600px;
		overflow-y: auto;
		min-height: 400px;
	}

	.kanban-column h2 {
		text-align: center;
		margin-bottom: 15px;
	}

	/* Task styling */
	.task-card {
		background-color: white;
		padding: 10px;
		margin-bottom: 10px;
		border-radius: 5px;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		border-left: 4px solid; /* Default border for color-coded tasks */
	}

	.task h3 {
		margin: 0;
	}

	.task p {
		margin: 5px 0;
	}

	.task-owner {
		font-size: 0.9em;
		color: #888;
	}

	.view-link {
		color: #007bff;
		cursor: pointer;
		text-decoration: underline;
	}

	/* Column Header Colors */
	.Open h2 {
		color: #1e90ff;
	}

	.Todo h2 {
		color: #f4c430;
	}

	.Doing h2 {
		color: #ff6347;
	}

	.Done h2 {
		color: #32cd32;
	}

	.Close h2 {
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

	/* Scrollbar styling (optional) */
	/* .kanban-column::-webkit-scrollbar {
        width: 8px;
    }

    .kanban-column::-webkit-scrollbar-thumb {
        background-color: #ccc;
        border-radius: 4px;
    }

    .kanban-column::-webkit-scrollbar-track {
        background-color: #f8f9fa;
    } */

	.task-list {
		max-height: 350px; /* Set a maximum height for the list */
		overflow-y: auto; /* Enable vertical scrolling */
		border: 1px solid #ccc; /* Optional: add a border for visual clarity */
		padding: 10px; /* Optional: add some padding */
		border-radius: 4px; /* Optional: rounded corners */
		background-color: #f8f9fa; /* Background color */
	}
</style>
