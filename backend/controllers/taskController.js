const pool = require("../config/db");
let mailer = require("../utils/mailer");

// get all, get 1, create, edit

// working
exports.getAllTasks = async (req, res) => {
  let taskList = [];
  const { Task_app_Acronym } = req.body;
  console.log("Get all tasks: ");
  console.log("Task_app_Acronym: ", Task_app_Acronym);
  try {
    let statement = "SELECT * FROM Task WHERE Task_app_Acronym=?";
    let [allTasks] = await pool.query(statement, [Task_app_Acronym]);

    // populate tasks into tasklist
    allTasks.forEach((task) => {
      let box = {
        Task_app_Acronym: task.task_app_Acronym,
        Task_createDate: task.Task_createDate,
        Task_creator: task.Task_creator,
        Task_description: task.Task_description,
        Task_id: task.Task_id,
        Task_name: task.Task_name,
        Task_notes: task.Task_notes,
        Task_owner: task.Task_owner,
        Task_plan: task.Task_plan,
        Task_state: task.Task_state,
      };
      taskList.push(box);
    });

    res.status(200).send(taskList);
  } catch (error) {
    res.status(500).send("Error: ", error);
  }
};

exports.getAllTasksWithColour = async (req, res) => {
  let taskList = [];
  const { Task_app_Acronym } = req.body;
  console.log("getAllTasksWithColour: ");
  console.log("Task_app_Acronym: ", Task_app_Acronym);
  try {
    let statement = "select t.*, p.Plan_colour from Task t left join plan p on t.Task_plan = p.Plan_MVP_name where t.Task_App_Acronym =? ";
    let [allTasks] = await pool.query(statement, [Task_app_Acronym]);
    console.log(allTasks);

    // populate tasks into tasklist
    allTasks.forEach((task) => {
      let box = {
        Task_app_Acronym: task.task_app_Acronym,
        Task_createDate: task.Task_createDate,
        Task_creator: task.Task_creator,
        Task_description: task.Task_description,
        Task_id: task.Task_id,
        Task_name: task.Task_name,
        Task_notes: task.Task_notes,
        Task_owner: task.Task_owner,
        Task_plan: task.Task_plan,
        Task_state: task.Task_state,
        Plan_colour: task.Plan_colour,
      };
      taskList.push(box);
    });

    res.status(200).send(taskList);
  } catch (error) {
    res.status(500).send("Error: ", error);
  }
};

// Working
exports.getRnumber = async (req, res) => {
  const { App_Acronym } = req.body;
  console.log("App_Acronym: ", App_Acronym);
  try {
    let statement = "SELECT App_Rnumber from application where App_Acronym=?";
    let [rNumResult] = await pool.query(statement, [App_Acronym]);
    console.log(rNumResult);
    res.status(200).send(rNumResult);
  } catch (error) {
    res.status(500).send("Error", error);
  }
};

exports.getTask = async (req, res) => {
  const { Task_id } = req.body;
  console.log("Task_id ", Task_id);
  try {
    let statement = "SELECT * FROM Task WHERE Task_id =?";
    let [getTask] = await pool.query(statement, [Task_id]);
    res.status(200).send(getTask);
  } catch (error) {
    res.status(500).send("Error", error);
  }
};

//the Task_id = App_Acronym and App_Rnumber
exports.createTask = async (req, res) => {
  console.log("Create New Task: ", req.body);
  const { Task_name, Task_description, Task_notes, Task_plan, Task_app_Acronym, Task_state, Task_creator, Task_owner, Task_createDate } = req.body;

  let currentRnum;
  let addRnum;
  let newId = "";

  // Get rNumber
  try {
    let statement = "SELECT App_Rnumber from application where App_Acronym=?";
    let [rNumResult] = await pool.query(statement, [Task_app_Acronym]);
    currentRnum = rNumResult[0].App_Rnumber;
    console.log("Current R_number: ", currentRnum);
    addRnum = currentRnum + 1;
  } catch (error) {
    res.status(500).send("Error", error);
  }

  newId = Task_app_Acronym + "_" + addRnum.toString();
  console.log("Task_id: ", newId);
  console.log("App_Acronym: ", Task_app_Acronym);

  //get connection from pool
  const connection = await pool.getConnection();
  try {
    //start transaction
    await connection.beginTransaction();

    // if no task plan is selected
    if (Task_plan === "") {
      console.log("No task plan selected:");
      //Insert new Task
      let statement =
        "INSERT INTO Task (Task_id,Task_name,Task_description,Task_notes,Task_app_Acronym,Task_state,Task_creator,Task_owner,Task_createDate) VALUES (?,?,?,?,?,?,?,?,?)";
      let [createTask] = await connection.execute(statement, [
        newId,
        Task_name,
        Task_description,
        Task_notes,
        Task_app_Acronym,
        Task_state,
        Task_creator,
        Task_owner,
        Task_createDate,
      ]);
    } else {
      console.log("Task plan has been selected:");
      //Insert new Task with task plan selected

      let statement =
        "INSERT INTO Task (Task_id,Task_name,Task_description,Task_notes,Task_app_Acronym,Task_state,Task_creator,Task_owner,Task_createDate) VALUES (?,?,?,?,?,?,?,?,?)";
      let [createTask] = await connection.execute(statement, [
        newId,
        Task_name,
        Task_description,
        Task_notes,
        Task_app_Acronym,
        Task_state,
        Task_creator,
        Task_owner,
        Task_createDate,
      ]);

      //update task with task plan
      console.log("Task Plan: ", Task_plan);
      let statementTwo = "UPDATE Task SET Task_plan=? where Task_id=?";

      let [updateTaskplan] = await connection.execute(statementTwo, [Task_plan, newId]);

      //await connection.commit();
    }

    //update task with task plan
    // let statementTwo = "UPDATE Task SET Task_plan=? where Task_id=?";

    // let [updateTaskplan] = await connection.execute(statementTwo, [Task_plan, newId]);

    // Update R_Number in application

    let newStatement = "UPDATE Application SET App_Rnumber=? WHERE App_Acronym=?";

    let [updateApp] = await connection.execute(newStatement, [addRnum, Task_app_Acronym]);

    // Commit the transaction if no errors occured
    await connection.commit();

    //release connection back to pool
    connection.release();
    res.status(200).send("New Task has been successfully added.");
  } catch (error) {
    // Roll back the transaction in case of an error
    if (connection) {
      await connection.rollback();
      console.log("Rollback has occured!");
      connection.release();
    }
    res.status(500).send(error);
  }
};

// Task_name,
exports.updateTaskName = async (req, res) => {
  console.log("Update of task Name: ", req.body);
  const { Task_id, Task_name } = req.body;
  try {
    let statement = "UPDATE Task SET Task_name=? WHERE Task_id=?";

    let [updateTaskName] = await pool.execute(statement, [Task_name, Task_id]);
    res.status(200).send("Task Name is Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating Task's name");
  }
};

//Task_description,
exports.updateTaskDescription = async (req, res) => {
  console.log("Update of task Description: ", req.body);
  const { Task_id, Task_description } = req.body;
  try {
    let statement = "UPDATE Task SET Task_description=? WHERE Task_id=?";
    let [updateTaskDescript] = await pool.execute(statement, [Task_description, Task_id]);
    res.status(200).send("Task Description is Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating Task's Description");
  }
};

//Task_notes,
exports.updateTaskNotes = async (req, res) => {
  console.log("Update of task notes: ", req.body);
  const { Task_id, Task_notes } = req.body;
  try {
    let statement = "UPDATE Task SET Task_notes=? WHERE Task_id=?";
    let [updateTaskNotes] = await pool.execute(statement, [Task_notes, Task_id]);
    res.status(200).send("Task's notes is Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating Task's notes");
  }
};

//Task_plan,
exports.updateTaskPlan = async (req, res) => {
  console.log("Update of task plan: ", req.body);
  const { Task_id, Task_plan } = req.body;
  try {
    let statement = "UPDATE Task SET Task_plan=? WHERE Task_id=?";
    let [updateTaskPlan] = await pool.execute(statement, [Task_plan, Task_id]);
    res.status(200).send("Task's plan is Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating Task's plan");
  }
};

//Task_app_Acronym, same as the grp name (aphla num, underscroll, no space, min length=1)
exports.updateTaskAppAcronym = async (req, res) => {
  console.log("Update of task app acronym: ", req.body);
  const { Task_id, Task_app_Acronym } = req.body;
  try {
    let statement = "UPDATE Task SET Task_app_Acronym=? WHERE Task_id=?";
    let [updateTaskAppAcronym] = await pool.execute(statement, [Task_app_Acronym, Task_id]);
    res.status(200).send("Task_app_Acronym is Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating Task_app_Acronym");
  }
};

//Task_state,
exports.updateTaskState = async (req, res) => {
  console.log("Update of task state: ", req.body);
  const { Task_id, Task_state } = req.body;
  try {
    let statement = "UPDATE Task SET Task_state=? WHERE Task_id=?";
    let [updateTaskState] = await pool.execute(statement, [Task_state, Task_id]);
    res.status(200).send("Task's state is Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating Task's state");
  }
};

//Task_creator,
exports.updateTaskCreator = async (req, res) => {
  console.log("Update of task creator: ", req.body);
  const { Task_id, Task_creator } = req.body;
  try {
    let statement = "UPDATE Task SET Task_creator=? WHERE Task_id=?";

    let [updateTaskCreator] = await pool.execute(statement, [Task_creator, Task_id]);
    res.status(200).send("Task Creator is Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating Task's Creator");
  }
};

//Task_owner
exports.updateTaskOwner = async (req, res) => {
  console.log("Update of task owner: ", req.body);
  const { Task_id, Task_owner } = req.body;
  try {
    let statement = "UPDATE Task SET Task_owner=? WHERE Task_id=?";

    let [updateTaskOwner] = await pool.execute(statement, [Task_owner, Task_id]);
    res.status(200).send("Task Owner is Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating Task's Owner");
  }
};

//Task_createDate
exports.updateTaskCreateDate = async (req, res) => {
  console.log("Update of task create date: ", req.body);
  const { Task_id, Task_createDate } = req.body;
  try {
    let statement = "UPDATE Task SET Task_createDate=? WHERE Task_id=?";

    let [updateTaskCreatedDate] = await pool.execute(statement, [Task_createDate, Task_id]);
    res.status(200).send("Task Create Date is Updated Successfully");
  } catch (err) {
    res.status(500).send("Error updating Task's Create Date");
  }
};

//Task update with plan change
exports.updateTaskwithPlan = async (req, res) => {
  console.log("Update of Task with change of plan: ", req.body);
  const { Task_id, Task_plan, Task_state, Task_notes, Task_owner, Previous_state, Task_creator } = req.body;

  if (Task_plan === "") {
    Task_plan == null;
    console.log("No Task_plan is selected: ", Task_plan);
  }

  //Update the plan
  //get connection from pool
  const connection = await pool.getConnection();
  try {
    //start transaction
    await connection.beginTransaction();

    let statement = "";

    //if no plan selected
    if (Task_plan === "") {
      statement = "UPDATE Task SET Task_plan=NULL where Task_id=?";
      console.log("No Task_plan is selected: ", Task_plan);
    } else {
      // update task plan
      statement = "UPDATE Task SET Task_plan=? where Task_id=?";
    }

    let [updateTaskplan] = await connection.execute(statement, [Task_plan, Task_id]);

    // update task state and notes
    let statementTwo = "UPDATE Task SET Task_state=?, Task_notes=?, Task_owner=? WHERE Task_id=?";

    let [updateTask] = await connection.execute(statementTwo, [Task_state, Task_notes, Task_owner, Task_id]);
    // Commit the transaction if no errors occured

    let email, taskName, taskAppAcronym;

    // sending email to inform if the promoted state is done
    if (Previous_state == "doing" && Task_state == "done") {
      console.log("The task's state is transiting to done from doing.");
      let eStatement = "SELECT u.Email, t.Task_name, t.Task_app_Acronym from Task t join User u on t.Task_creator = u.User_name WHERE Task_id =?";

      let [newResults] = await pool.execute(eStatement, [Task_id]);
      if (newResults) {
        email = newResults[0].Email;
        taskName = newResults[0].Task_name;
        taskAppAcronym = newResults[0].Task_app_Acronym;
        if (email == "") {
          email = "sentHr@email.com";
        }
      }
      console.log("Email: ", email);
      console.log("Task Name: ", taskName);
      console.log("Task_app_Acronym: ", taskAppAcronym);
      await sendEmail(email, taskName, Task_creator, taskAppAcronym);
    }

    await connection.commit();

    //release connection back to pool
    connection.release();
    res.status(200).send("Task with new plan and state are updated Successfully");
  } catch (err) {
    // Roll back the transaction in case of an error
    if (connection) {
      await connection.rollback();
      console.log("Rollback has occured!");
      connection.release();
    }
    res.status(500);
  }
};

//Task update
exports.updateTask = async (req, res) => {
  console.log("Update of Task: ", req.body);
  const { Task_id, Task_state, Task_notes, Task_owner, Previous_state, Task_creator } = req.body;

  const connection = await pool.getConnection();
  try {
    //start transaction
    await connection.beginTransaction();

    let statementOne = "UPDATE Task SET Task_owner=? WHERE Task_id=?";

    let [updateTask] = await connection.execute(statementOne, [Task_owner, Task_id]);

    let statementTwo = "UPDATE Task SET Task_notes=?, Task_state=? WHERE Task_id=?";

    let [updateTaskCreatedDate] = await connection.execute(statementTwo, [Task_notes, Task_state, Task_id]);

    // sending email to inform if the promoted state is done
    if (Previous_state == "doing" && Task_state == "done") {
      console.log("The task's state is transiting to done from doing.");
      let eStatement = "SELECT u.Email, t.Task_name, t.Task_app_Acronym from Task t join User u on t.Task_creator = u.User_name WHERE Task_id =?";

      let [newResults] = await pool.execute(eStatement, [Task_id]);
      if (newResults) {
        email = newResults[0].Email;
        taskName = newResults[0].Task_name;
        taskAppAcronym = newResults[0].Task_app_Acronym;
        // if user has no email
        if (email == "") {
          email = "sendHr@email.com";
        }
      }
      console.log("Email: ", email);
      console.log("Task Name: ", taskName);
      console.log("Task_app_Acronym: ", taskAppAcronym);
      await sendEmail(email, taskName, Task_creator, taskAppAcronym);
    }

    await connection.commit();

    //release connection back to pool
    connection.release();
    res.status(200).send("Task with new state is Updated Successfully");
  } catch (err) {
    if (connection) {
      await connection.rollback();
      console.log("Rollback has occured!");
      connection.release();
    }
    res.status(500).send("Error updating Task with new state");
  }
};

async function sendEmail(user, task_name, promotor, app_acronym) {
  console.log("Now sending the email!");
  const info = mailer.sendMail({
    from: '"TMS" <no-reply.TMS@ethereal.email>', // sender address
    to: `${user}`, // list of receivers
    subject: `${task_name} is done`, // Subject line
    text: `${task_name} for ${app_acronym} has been promoted to the done state by ${promotor}`, // plain text body
    //html: "<b>Hello world?</b>" // html body
  });
}
