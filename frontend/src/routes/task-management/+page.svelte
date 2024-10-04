<script>
	import logo from '$lib/assets/user.png';
	import TaskPopup from '../../components/TaskPopup.svelte';

	import PlanModal from '../../components/Plan.svelte';
	import { onMount } from 'svelte';
	import axios from 'axios';
	import { goto } from '$app/navigation';
	import { appAcronymStore } from '$lib/stores'; // Import the store
	import TopNavBar from '../../components/NavBar.svelte';
	import EditPlan from '../../components/EditPlan.svelte';
	import Toast from '../../components/Toast.svelte';
	import { addToast } from '../../components/store';


	import TaskCreate from '../../components/TaskCreate.svelte';
	import TaskEdit from '../../components/TaskEdit.svelte';

	let username = '';
	let userId=null;
	let groupname = '';
	let errorMessage = '';
	let successMessage = '';
	let activeStatus='';
	
	//let pageName = 'Kanban';
	let isLoading = true;
	//let appName=appAcronym;
	let appTitle='';
	let title='';
	let pageName = title;

	let isAdmin=false;
	let isPL=false;
	let isPM=false;
	// app permmisions flags
	let appPermitCreate=false;
	let appPermitOpen=false;
	let appPermitToDo=false;
	let appPermitDoing=false;
	let appPermitDone=false;
	// group
	let grpPermitCreate='';
	let grpPermitOpen='';
	let grpPermitToDo='';
	let grpPermitDoing='';
	let grpPermitDone='';

	let appAcronym =null;
	 appAcronymStore.subscribe(value=> {
		appAcronym = value;
		appTitle=appAcronym.toString();
		console.log("App Title: ",appTitle);
		console.log("The app selected :",appAcronym);
		title=appTitle+ ' Kanban';
		pageName = title;
	 }); 

	export async function getAppPermit(groupname){
		console.log("Getting App's Permissions: ",appAcronym);
		try{
			const response = await axios.post(
				'http://localhost:3000/tasks/get-app',{
                    App_Acronym: appAcronym
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    withCredentials: true
                }
            );
        if (response.status === 200) {
			let data=response.data[0];
			console.log("App Data revceived: ",data);
			grpPermitCreate=data.App_permit_Create;
			grpPermitOpen=data.App_permit_Open;
			grpPermitToDo=data.App_permit_toDoList;
			//console.log("Todo permission: ",grpPermitToDo);
			grpPermitDoing=data.App_permit_Doing;
			grpPermitDone=data.App_permit_Done;
			console.log("User's group Names: ",groupname);

			//set permission:
			if(groupname.includes(grpPermitCreate))
			{
				console.log("User has create permission");
				appPermitCreate=true;
			}
			if(groupname.includes(grpPermitOpen))
			{
				console.log("User has open permission");
				appPermitOpen=true;
			}
			if(groupname.includes(grpPermitToDo))
			{
				console.log("User has todo permission");
				appPermitToDo=true;
			}
			if(groupname.includes(grpPermitDoing))
			{
				console.log("User has doing permission");
				appPermitDoing=true;
			}
			if(groupname.includes(grpPermitDone))
			{
				console.log("User has done permission");
				appPermitDone=true;
			}
		}
		} catch (error) {
			console.error('Eror fetching app permit:', error);
			goto('/');
	}
}

	//-------------------Plan
	let showPlanModal = false; // Controls the modal visibility
	let newPlan = null; // Holds the new plan details if created

	function handlePlanCreated(event){
		//const newPlan = event.detail;
		//plansList = [...plansList,newPlan];
		getPlans();
		showPlanModal = false;
	}

	const openPlanModal = () => {
		showPlanModal = true;
	};

	function closePlanModal() {
		console.log("Closing Create Plan window");
		newPlan=null;
		showPlanModal = false;
	};

	//------------------Task ------------
	
	// Helper function to filter tasks by their state
	const getTasksByState = (state) => taskList.filter((task) => task.Task_state === state);

	let plansList = [];
	let planNames = [];

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
			groupname = data.map(grp => grp.Group_name);
			getAppPermit(groupname);
              if (Array.isArray(data)) 
              {
				 for (const group of data) {
                    if (group.Group_name.toLowerCase() === 'admin') {
                        isAdmin = true; // Set isAdmin to true if 'admin' group is found
                    }
                    if (group.Group_name.toLowerCase() === 'pl') {
                        isPL = true; // Set isUser to true if 'user' group is found
                    }
					if (group.Group_name.toLowerCase() === 'pm') {
                        isPM = true; // Set isUser to true if 'user' group is found
                    }
                    // Break early if both flags are set to true
                    if (isAdmin && isPL) {
                        break;
                    }
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
			goto('/'); // Use goto for navigation
		}
	}

	async function getPlans() {
		try {
			// get the group this user is in
			const response = await axios.post('http://localhost:3000/tasks/get-related-plans',
			{
				Plan_app_Acronym: appAcronym
			},
			{
				withCredentials: true
			});

			if (response.status === 200) {
				const data = await response.data;
				console.log("Data :",data);
				console.log("Data length: ",data.length)
				//add empty plan
				if(data.length==0)
				{
					console.log("No plan was retreived for this app.");
					plansList=[];
				}
				else if(data.length==1)
				{
					plansList=data;
					let tempName=data[0].Plan_MVP_name;
					planNames.push(tempName);
					console.log("Plan Names Single: ",planNames);
				} else 
				{
					plansList=data;
					planNames = [...data.map((plan)=>plan.Plan_MVP_name)];
				}
				//groups = [...groupList.map((group: string) => group.Group_name)];
				//planNames = [...data.map((plan)=>plan.Plan_MVP_name)];
				//planNames = data.map(plan => plan.Plan_MVP_name);
				//console.log(planNames);			 
			}
			if (response.status == 403) {
				goto('/');
			}
		} catch (error) {
			console.error('Error fetching plans', error);
			//errorMessage = 'An error occurred while fetching plans.';
			goto('/');
		}
	}

	let taskList=[];
	async function getTasks(){
		console.log("Task_app_Acronym: ",appAcronym);
		console.log("Getting all tasks: ");
		try{
			//const response = await axios.post('http://localhost:3000/tasks/get-all-tasks',
			const response = await axios.post('http://localhost:3000/tasks/get-all-tasks-color',	
			{
				Task_app_Acronym: appAcronym
			},
			{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);
			if(response.status===200){
				const data = await response.data;
				taskList = data;
				console.log("List of tasks: ",taskList);
			}
		} catch (error){
			console.error('Error fetching tasks', error);
			//errorMessage = 'An error occurred while fetching plans.';
			goto('/');
		} finally {
			isLoading = false;
		}
	}

	let showTaskModal = false; // Controls the modal visibility
	let newTask = null; // Holds the new Task details if created

	function handleTaskCreated(event){
		//const newPlan = event.detail;
		//plansList = [...plansList,newPlan];
		getTasks();
		showTaskModal = false;
	}

	const openTaskModal = () => {
		console.log("Open task");
		showTaskModal=true;
	};

	function closeTaskModal() {
		console.log("Closing Create Task window");
		newTask=null;
		isLoading=true; // loading / close list of tasks till loading done
		getTasks(); // fetch tasks
		showTaskModal = false;
	};

	let fetchTask;

	async function handleTaskView(task){
		console.log("Handle Task View: ");
		console.log("Task id: ", task.Task_id);
	}

	async function handleTaskSelection(task){
		const {  } = task;

		console.log("Plan_MVP_name: ",Plan_MVP_name);
		console.log("Plan_app_Acronym: ",Plan_app_Acronym);

		try {
			const response = await axios.post('http://localhost:3000/tasks/get-task',{
				Plan_MVP_name: Plan_MVP_name,
				Plan_app_Acronym: Plan_app_Acronym
			},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);
			if(response.status=200)
			{
				console.log(response.data[0]);
				// fetch plan
				fetchTask= response.data[0];
				console.log("Plan retrieved: ",fetchTask);
				openEditPlanModal(fetchTask);
			}
		} catch (error){
			console.log("Error fetching information for plan");
		}
	}
	// Edit Plan Modal
	let showEditTaskModal = false; // Controls the modal visibility
	let editTask = null; // Holds the Task details if created

	//let selectedPlan = null;

	function openEditTaskModal(task) {
		console.log("Open Edit Task View: ");
		console.log("Task id: ", task.Task_id);
		editTask=task;
		console.log("Task selected: ",editTask);
		showEditTaskModal=true;
	};

	const closeEditTaskModal = () => {
		console.log("Closing Edit Task window");
		editTask=null;
		console.log("Fetch tasks done!");
		isLoading=true;
		getTasks();
		showEditTaskModal = false;
	};

	function handleEditTask(){
		//getTasks();
		console.log("Closing Edit Task window");
		editTask=null;
		getTasks();
        showEditTaskModal = false;  // Close the modal
	}

	
	// async function handleColourPlan(planName,planAppAcronym)
	// {
	// 	let planColour='';
	// 	console.log("Getting Plan's colour");
	// 	console.log("Plan name: ",planName);
	// 	console.log("Plan_App_Acronym: ",planAppAcronym);

	// 	try {
	// 			const response = await axios.post('http://localhost:3000/tasks/get-plan-colour',{
	// 				Plan_MVP_name: planName,
	// 				Plan_app_Acronym: planAppAcronym
	// 			},
	// 				{
	// 					headers: {
	// 						'Content-Type': 'application/json'
	// 					},
	// 					withCredentials: true
	// 				}
	// 			);
	// 			if(response.status=200)
	// 			{
	// 				let colourFound=response.data[0].Plan_colour;
	// 				if(!colourFound)
	// 				{
	// 					colourFound='FF0000';
	// 				}
	// 				console.log("Plan fetched for colour");
	// 				console.log(response.data[0]);
	// 				planColour="#"+colourFound;
	// 				console.log("Plan's colour is: ",planColour);
	// 				return planColour;
	// 			}
	// 		} catch (error){
	// 			console.log(error);
	// 		}
	// 	}

	//------------------------------------------

	let dropDownMenu = false;

	function openDropDown(){
		console.log("Dropdown window is clicked");
		dropDownMenu = true;
	}

	function closeDropDown(){
		dropDownMenu = false;
	}

	function handlePlanDropDown(){
		openPlanModal();
		closeDropDown();
	}

	let fetchPlan;

	async function handlePlanSelection(plan){
		const { Plan_MVP_name, Plan_app_Acronym } = plan;

		dropDownMenu = false;
		console.log("Plan_MVP_name: ",Plan_MVP_name);
		console.log("Plan_app_Acronym: ",Plan_app_Acronym);

		try {
			const response = await axios.post('http://localhost:3000/tasks/get-plan',{
				Plan_MVP_name: Plan_MVP_name,
				Plan_app_Acronym: Plan_app_Acronym
			},
				{
					headers: {
						'Content-Type': 'application/json'
					},
					withCredentials: true
				}
			);
			if(response.status=200)
			{
				console.log(response.data[0]);
				// fetch plan
				fetchPlan= response.data[0];
				console.log("Plan retrieved: ",fetchPlan);
				openEditPlanModal(fetchPlan);
			}
		} catch (error){
			console.log("Error fetching information for plan");
		}
	}
	// Edit Plan Modal
	let showEditPlanModal = false; // Controls the modal visibility
	let editPlan = null; // Holds the new plan details if created

	//let selectedPlan = null;

	function openEditPlanModal(plan) {
		console.log("isPM: ",isPM);
		editPlan=plan;
		console.log("Plan selected: ",editPlan);
		showEditPlanModal=true;
	};

	const closeEditPlanModal = () => {
		console.log("Closing Edit Plan window");
		editPlan=null;
		showEditPlanModal = false;
	};

	function handleEditPlan(){
		//GetApps();
        showEditPlanModal = false;  // Close the modal
	}

	//---------------------------------------------------------------

	onMount(() => {
		GetProfile();
		getPlans();
		getTasks();
	});

</script>

<TopNavBar {pageName} {username} {isAdmin}/>

<!-- Header Section -->
<div class="header-buttons">
	{#if appPermitCreate}
	<button class="taskButton" on:click={openTaskModal}>Create Task</button>
	{/if}
	<button class="planButton" on:click="{openDropDown}">Plan</button>
	<!-- <button class="planButton" on:click="{openPlanModal}">Plan</button>-->
</div>
<!-- Dropdown Menu -->
 {#if dropDownMenu}
<div class="dropdown" aria-labelledby="dropdownButton" on:mouseleave={closeDropDown}>
	{#each plansList as plan}
		<a href="#" on:click="{()=>handlePlanSelection(plan)}">{plan.Plan_MVP_name}</a>
	{/each}
	{#if isPM}
	<a href="#" on:click={openPlanModal}>Create New Plan</a>
	{/if}
</div>
{/if}

{#if isLoading}
	<!-- Show loading spinner or message until data is fetched -->
	<p>Loading tasks...</p>
{:else}
<!-- Kanban Board Layout -->
<div class="kanban-board">
	<!-- Open Column -->
	<div class="kanban-column Open">
		<h2>Open</h2>
		<div class="task-list">
			{#each getTasksByState('open') as task}
			<div class="task-card" style="border-left-color:#{task.Plan_colour}">

				<!-- <div class="task-card" style="border-left-color:{handleColourPlan(task.Task_plan, appAcronym)};"> -->
					<h3 class="taskName" id={task.Task_id}>{task.Task_name}</h3>
					<!--<div id="task_id" style="visibility: hidden;">{task.Task_id}</div>-->
					<p class="taskDescription">{task.Task_description}</p>
					<p class="task-owner">Owner: {task.Task_owner}</p>
					<!---<span class="view-link">View</span>-->
					<div class="link">
						<!---<a href="#" on:click="{() => openEditModal(app)}">Edit</a>-->
						<a href="#" on:click="{() => openEditTaskModal(task)}">View</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Todo Column -->
	<div class="kanban-column Todo">
		<h2>Todo</h2>
		<div class="task-list">
			{#each getTasksByState('todo') as task}
				<div class="task-card" style="border-left-color:#{task.Plan_colour}">
					<h3 class="taskName" id={task.Task_id}>{task.Task_name}</h3>
					<p class="taskDescription">{task.Task_description}</p>
					<p class="task-owner">Owner: {task.Task_owner}</p>
					<!---<span class="view-link">View</span>-->
					<div class="link">
						<!---<a href="#" on:click="{() => openEditModal(app)}">Edit</a>-->
						<a href="#" on:click="{() => openEditTaskModal(task)}">View</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Doing Column -->
	<div class="kanban-column Doing">
		<h2>Doing</h2>
		<div class="task-list">
			{#each getTasksByState('doing') as task}
				<div class="task-card" style="border-left-color:#{task.Plan_colour}">
					<h3 class="taskName" id={task.Task_id}>{task.Task_name}</h3>
					<p class="taskDescription">{task.Task_description}</p>
					<p class="task-owner">Owner: {task.Task_owner}</p>
					<!---<span class="view-link">View</span>-->
					<div class="link">
						<!---<a href="#" on:click="{() => openEditModal(app)}">Edit</a>-->
						<a href="#" on:click="{() => openEditTaskModal(task)}">View</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Done Column -->
	<div class="kanban-column Done">
		<h2>Done</h2>
		<div class="task-list">
			{#each getTasksByState('done') as task}
				<div class="task-card" style="border-left-color:#{task.Plan_colour}">
					<h3 class="taskName" id={task.Task_id}>{task.Task_name}</h3>
					<p class="taskDescription">{task.Task_description}</p>
					<p class="task-owner">Owner: {task.Task_owner}</p>
					<!---<span class="view-link">View</span>-->
					<div class="link">
						<!---<a href="#" on:click="{() => openEditModal(app)}">Edit</a>-->
						<a href="#" on:click="{() => openEditTaskModal(task)}">View</a>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Close Column -->
	<div class="kanban-column Closed">
		<h2>Closed</h2>
		<div class="task-list">
			{#each getTasksByState('closed') as task}
				<div class="task-card" style="border-left-color:#{task.Plan_colour}">
					<h3 class="taskName" id={task.Task_id}>{task.Task_name}</h3>
					<p class="taskDescription">{task.Task_description}</p>
					<p class="task-owner">Owner: {task.Task_owner}</p>
					<!---<span class="view-link">View</span>-->
					<div class="link">
						<!---<a href="#" on:click="{() => openEditModal(app)}">Edit</a>-->
						<a href="#" on:click="{() => openEditTaskModal(task)}">View</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>

	<!-- Create Plan Modal -->
	{#if showPlanModal}
	<PlanModal {planNames} {appAcronym} on:close={closePlanModal} on:planCreated={handlePlanCreated}/>
	<!--<PlanModal isOpen={showPlanModal} closeModal={closePlanModal} />-->
	{/if}

	<!-- Edit Plan Modal -->
	{#if showEditPlanModal}
		<!---<EditPlan isOpen={showEditPlanModal} {editPlan} closeModal={closeEditPlanModal} />-->
		<EditPlan {editPlan} {isPM} on:close={closeEditPlanModal} on:planEdited={handleEditPlan}/>
	{/if}

	<!-- Create Task Modal -->
	{#if showTaskModal }
		<TaskCreate {appAcronym} {planNames} {username} {userId} on:close={closeTaskModal} on:taskCreated={handleTaskCreated}/>
		<!---<TaskCreate on:close={closeTaskModal} on:planEdited={handleTaskCreated}/>-->
	{/if}

	<!-- Edit Task Modal -->
	{#if showEditTaskModal}
		<TaskEdit {editTask} {planNames} {username} on:close={closeEditTaskModal} on:planEdited={handleEditTask}/>
	{/if}
	<Toast/>
{/if}
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

	/* Kanban board and columns */
	.kanban-board {
		display: flex;
		justify-content: space-between;
		gap: 10px;
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

	.taskName, .taskDescription{
		word-wrap: break-word;
		overflow-y: auto;
	}

	/* Column Header Colors 
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
	}*/

	/* Task Card Colors */
	/* .task-card {
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
	} */

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
		max-height: 500px; /* Set a maximum height for the list */
		overflow-y: auto; /* Enable vertical scrolling */
		border: 1px solid #ccc; /* Optional: add a border for visual clarity */
		padding: 5px; /* Optional: add some padding */
		border-radius: 4px; /* Optional: rounded corners */
		background-color: #f8f9fa; /* Background color */
	}

	.header-buttons{
		display: flex;
		justify-content: flex-end; /* Align items to the right */
		padding: 4px;
	}

	.dropdown {
    position: absolute;
    top: 115px;
    right: 12px;
    background-color: white;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    border-radius: 4px;
    z-index: 100;
    min-width: 100px;
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

	.dropDown a:last-child {
		border-bottom: none;
	}

	/* .planButton:hover {
    display: block;
  	}
	 */
	/* .planButton:hover .dropdown {
    display: block;
  	} */
</style>
