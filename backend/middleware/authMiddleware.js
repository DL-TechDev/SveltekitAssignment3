const jwt = require("jsonwebtoken");
require("dotenv").config();
const pool = require("../config/db");

// Middleware to check if the user is authenticated
async function authenticateToken(req, res, next) {
  const data = req.body;
  console.log("Req Body: ", data);
  const token = req.cookies.token;

  if (token == null)
    return res.status(401).json({status: "error",message: "Token required.",
});

  let result;
  try {
        result = jwt.verify(token, process.env.JWT_SECRET);
        // Missing token
        if (!result) {
          return res.status(403).json({ status: "error", message: "Invalid token" });
        }
        // Different browser
        if (result.browser != req.headers["user-agent"]) {
          return res.status(403).json({ status: "error", message: "Invalid token" });
        }
        // Invalid Ip address
        if (result.ipaddress != req.ip) {
          return res.status(403).json({ status: "error", message: "Invalid token" });
        }
        console.log(result.User_name);
        let [results] = await pool.query(`SELECT User_name, active from User WHERE User_name = ?`, [result.User_name]);
        console.log(results);

       let activeStatus = results[0].active;
        let User_name = result.User_name;
        console.log(activeStatus);
        if (activeStatus === 0) {
          return res.status(401).json({ status: "error", message: "Invalid Creditials" });
        }

        const purpose = Object.entries(data).some(([key, value]) => key === "Purpose");

    if (purpose) {
      const Task_app_Acronym = data.Task_app_Acronym;
      const Task_state = data.Previous_state;
      console.log("This is sent from Task");
      console.log("Username: ", User_name);
      console.log("Task_state: ", Task_state);
      console.log("Task_app_acronym ", Task_app_Acronym);
      // checkRoles(User_name, Task_state, Task_app_Acronym);
      // console.log("We are done checking the roles.");

      // get group names for this user
      let statement =
        "SELECT u.User_name, u.Email, u.Active, g.Group_name FROM User u " +
        "JOIN User_group ug ON u.User_name = ug.User_name " +
        "JOIN Grouplist g ON ug.Group_id = g.Group_id WHERE u.User_name = ?";
      const [result, fields] = await pool.query(statement, [User_name]);
      console.log("List of Groups: ", result);
      const grpNames = result.map((group) => group.Group_name);
      console.log("List of Groups Nmes: ", grpNames);

      // get app permission:
       let statementTwo = "SELECT App_Permit_Create, App_Permit_Open, App_Permit_toDoList,App_Permit_Doing,App_Permit_Done from Application WHERE App_Acronym =?";
       const [resultTwo] = await pool.query(statementTwo, [Task_app_Acronym]);
      console.log("List of Permissions: ", resultTwo);
      //console.log("Permit to Open:", resultTwo[0].App_Permit_Open);

      //check permission

       if (Task_state == "create") {
         console.log("The current task's state is create.");
         if (grpNames.includes(resultTwo[0].App_Permit_Create)) {
           console.log("Yes, user has permit to create this task");
         } else {
           console.log("No, this user is not authorized to create task");
           return res.status(403).json({ status: "error", message: "Unauthorized access" });
         }
       } 
      else if (Task_state == "open") {
          console.log("The current task's state is open.");
          if (grpNames.includes(resultTwo[0].App_Permit_Open)) {
            console.log("Yes, user has permit to edit this task");
          } else {
            console.log("No, this user is not authorized to promote task");
            return res.status(403).json({ status: "error", message: "Unauthorized access" });
          }
       }
       else if (Task_state == "todo") {
          console.log("The current task's state is todo.");
          if (grpNames.includes(resultTwo[0].App_Permit_toDoList)) {
            console.log("Yes, user has permit to edit this task");
          } else {
            console.log("No, this user is not authorized to promote task");
            return res.status(403).json({ status: "error", message: "Unauthorized access" });
          }
       }
       else if (Task_state == "doing") {
          console.log("The current task's state is doing.");
          if (grpNames.includes(resultTwo[0].App_Permit_Doing)) {
            console.log("Yes, user has permit to edit this task");
          } else {
            console.log("No, this user is not authorized to promote task");
            return res.status(403).json({ status: "error", message: "Unauthorized access" });
          }
       }
       else if (Task_state == "done") {
          console.log("The current task's state is done.");
          if (grpNames.includes(resultTwo[0].App_Permit_Done)) {
            console.log("Yes, user has permit to edit this task");
          } else {
            console.log("No, this user is not authorized to promote task");
            return res.status(403).json({ status: "error", message: "Unauthorized access" });
          }
        }
      }

         
      if (Object.entries(data).length === 0) {
        //console.log("data is empty");
        req.body = result;
        //res.json({token});
      } else {
        //console.log("data not empty");
        req.body = data;
      }
  } catch (err) {
    console.log(err);
    return res.status(403).json({ status: "error", message: "Invalid token" });
  }
  console.log("We are at the bottom of the function");
  next();
}

// Middleware to check if the user has a specific role
function authorizeRole(requiredRole) {
  return async (req, res, next) => {
    const token = req.cookies.token;
    result = jwt.verify(token, process.env.JWT_SECRET);
    const User_name = result.User_name;
    //console.log(User_name);
    if (await checkgroup(User_name, requiredRole)) {
      console.log("Checkgroup!");
      //console.log("We have cleared the authorizeRole");
      next();
    } else {
      return res.status(403).json({ status: "error", message: "Access denied." });
    }
  };
}

//-- App List --------------------
// group of roles authorized (Pm1, Pl2)
// upon login, applist (app loaded) PL (Create App button avail)
// Pm and PL can see edit button on the App
// pm, dev and non-pl cannot see the create app button, only see App list (View)
// -- both can click view  app, this will loaded permit
// when user click on app, it retrieved all tasks under this app / load the task management page.
//............ Task Management
// task are loaded according to thier state (column)
// when user click on each task "view" - task_id, user_name will send to verify on permit (from the app)


async function checkgroup(username, groupname) {
  try {
    //console.log("CheckGrp Function");
    // Query to check if the user is in the specified group directly
    const statement = `
      SELECT COUNT(*) AS isMember
      FROM user_group ug
      JOIN Grouplist gl ON ug.Group_id = gl.Group_id
      WHERE ug.User_name = ? AND gl.Group_name = ?
    `;
    //const connection = await pool.getConnection();
    const [results] = await pool.query(statement, [username, groupname]);
    //console.log(results);
    // If results[0].isMember is greater than 0, the user is in the group
    if (results[0].isMember > 0) {
      return true;
    }
  } catch (err) {
    console.error("Error checking group membership:", err);
    return false;
  }
}

async function checkRoles(username,state, acronym,) {
  const User_name = username;
    const nowState = state;
    let App_Acronym = acronym;
    let statement = "SELECT App_Permit_Open, App_Permit_toDoList,App_Permit_Doing,App_Permit_Done from Application WHERE App_Acronym =?";

    const [result] = await pool.query(statement, [App_Acronym]);
    console.log("List of Permissions: ", result);
    if (nowState == "open") {
      if (User_name == result.App_Permit_Open) {
        console.log("User has open permission");
        return;
      } else {
        res.status(403).json({ status: "error", message: "Access denied." });
      }
    }
    if (nowState == "todo") {
      if (User_name == result.App_Permit_toDoList) {
        console.log("User has todo permission");
        return;
      } else {
        res.status(403).json({ status: "error", message: "Access denied." });
      }
    }
    if (nowState == "doing") {
      if (User_name == result.App_Permit_Doing) {
        console.log("User has doing permission");
        return;
      } else {
        res.status(403).json({ status: "error", message: "Access denied." });
      }
    }
    if (nowState == "done") {
      if (User_name == result.App_Permit_Done) {
        console.log("User has done permission");
        return;
      } else {
        res.status(403).json({ status: "error", message: "Access denied." });
      }
    }
    
    
    //console.log(User_name);
    // if (await checkgroup(User_name, requiredRole)) {
    //   console.log("Checkgroup!");
      //console.log("We have cleared the authorizeRole");
      //next();
    // } else {
    //   return res.status(403).json({ status: "error", message: "Access denied." });
    // }
  };






module.exports = { authenticateToken, authorizeRole, checkgroup, checkRoles};
